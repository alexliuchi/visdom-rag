import os
import json
import psycopg2
from pathlib import Path
from sqlalchemy import create_engine
from llama_index.core import SQLDatabase
from llama_index.core.query_engine import (
    NLSQLTableQueryEngine,
)
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask import Flask, request, Response, jsonify, render_template,send_from_directory
from llama_index.core.schema import NodeWithScore
from llama_index.llms.ollama import Ollama
from llama_index.core.ingestion import IngestionPipeline
from init_models import init_llm_and_embed_in_Ollama, init_llm_in_Ollama
from webpage import url_to_document

from pyvis.network import Network

from llama_index.core.node_parser import (
    SentenceSplitter,
)
from llama_index.core.graph_stores import SimpleGraphStore

from llama_index.core import (
    SimpleDirectoryReader, 
    VectorStoreIndex,
    Settings,
    PromptTemplate,
    StorageContext,
    load_index_from_storage, 
    KnowledgeGraphIndex,
)

from llama_index.multi_modal_llms.ollama import OllamaMultiModal
from llama_index.core.indices.multi_modal.base import (
    MultiModalVectorStoreIndex,
)
from llama_index.embeddings.clip import ClipEmbedding
import qdrant_client
from llama_index.vector_stores.qdrant import QdrantVectorStore


app = Flask(__name__)
CORS(app, resources=r'*')

# 设置 no_proxy 环境变量
os.environ["NO_PROXY"] = os.environ["no_proxy"] = "localhost, 127.0.0.1/8, ::1"

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] =  100 * 1024 * 1024  # 限制上传大小为100MB


# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
current_path = os.getcwd()
saved_files = []
#set the default llm and embed model
Settings.llm, Settings.embed_model = init_llm_and_embed_in_Ollama("deepseek-r1:1.5b", 0.2, "quentinz/bge-large-zh-v1.5:latest")

'''
##########################
#   vrv-rag后端服务程序   #
##########################
处理上传文件
'''
@app.route('/api/vrv-rag/docs', methods=['POST'])
def get_admin_object():
    result = -1
    #try:
    # 获取上传类型
    upload_type = request.form.get('uploadType', 'multipleFiles')
    knowledgeBaseName = request.form.get('knowledge_base_name')
    print("docs-post-knowledgeBaseName: ", knowledgeBaseName)
    # 获取文件列表
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({"code": result, "error": "未选择文件"}), 400
    
    saved_files.clear()
    for file in files:
        #filePath = os.path.join(current_path, app.config["UPLOAD_FOLDER"], secure_filename(file.filename))
        #file_path, file_extension = os.path.splitext(filePath)
        #if file_extension in [".doc",".docx"]:
        #    print("The file path's file_extension is ", file_extension)
        #    # 将转换后的文件路径添加到列表中
        #    file.save(filePath)
        #    output_file = word2pdf(filePath)
        #    file.save(output_file)
        #    os.remove(filePath)
        #    saved_files.append(output_file)
        #    print(f'added {output_file} into the processing_pdf_list.')
        # 处理路径安全
        if upload_type == 'folder':
            # 保留目录结构
            full_path = file.filename.replace('\\', '/')
            parts = [secure_filename(p) for p in full_path.split('/') if p not in ('', '.', '..')]
        else:
            parts = [file.filename]

        if not parts:
            continue
        
        #if file_extension not in [".doc",".docx"]:
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], knowledgeBaseName, *parts)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        print('save_path:', save_path)
        file.save(save_path)
        saved_files.append(save_path)
        #processing_pdf_list.clear()
        #processing_pdf_list.extend(os.path.join(current_path, app.config["UPLOAD_FOLDER"], file.filename))
        print(f'added {os.path.join(current_path, app.config["UPLOAD_FOLDER"], file.filename)} into the processing_pdf_list.')
    return jsonify({"code": 0, 
                    "message":f"成功上传 {len(saved_files)} 个文件",
                    "data": {"saved_files": [os.path.relpath(p, app.config['UPLOAD_FOLDER']) 
                        for p in saved_files]}}), 200
    #except Exception as e:
    #    print(f'exception--------{str(e)}')
    return jsonify({"code":result,"message": str(e),"data":{}}), 400

'''
文件处理:分块，向量化,并创建索引
(Demo版暂存本地硬盘以后存入Qdrant等向量数据库)
'''
@app.route('/api/vrv-rag/docs', methods=['PUT'])
def process_documents():
    result = -1
    post_body_json_data = request.get_json()
    knowledgeBaseName = post_body_json_data['knowledge_base_name']
    chunkSize = post_body_json_data['chunk_size']
    chunkOverlap = post_body_json_data['chunk_overlap']
    embedModelName = post_body_json_data['embedding_model_name']
    llmModelName = post_body_json_data['llm_model_name']
    print('post_body_json_data:', post_body_json_data)
    processMode = post_body_json_data['process_mode'] #TODO:process_mode text已有，添加textimg multi_model
    #similarityTopK = post_body_json_data['similarity_top_k']
    

    Settings.llm,  Settings.embed_model = init_llm_and_embed_in_Ollama(llmModelName, 0.2, embedModelName)

    #try:
    print(f'saved_files:{saved_files[0]}')
    if(len(saved_files) == 0):
        return jsonify({"code":result,"message": "没有处理文件，请正确上传文件","data":{}}), 401
    if processMode == 'text':
        #create the data ingestion pipeline
        data_ingestion_pipeline = IngestionPipeline(name="VRV-RAG project data ingestion",
                                            project_name="VRV-RAG",
                                            transformations=[
                                                    SentenceSplitter(chunk_size = chunkSize, chunk_overlap = chunkOverlap),
                                                    #TitleExtractor(nodes=5),
                                                    #QuestionsAnsweredExtractor(questions=3),
                                                ],
                                            #vector_store=#TODO: store into the vector database like qdrant etc...
                                            #documents=,
                                            #cache=, #TODO:cache ingestion pipeline into the database like Redis  etc...
                                            #docstore=, #TODO:del-duplication docs, set up docstore like qdarant etc...
                                            #docstore_strategy=DocstoreStrategy.UPSERTS # del-duplication docs
                                            )
        print("Start to initialized the index")
        if not os.path.exists(f"./knowledge-base/{knowledgeBaseName}"):
            print("load a file to initialize the index")
            init_documents = SimpleDirectoryReader(input_files = saved_files).load_data(show_progress=True)
            nodes = data_ingestion_pipeline.run(documents = init_documents)
            vector_index = VectorStoreIndex(nodes)
            #TODO: store into a vector database like qdrant, mongodb etc...
            vector_index.storage_context.persist(persist_dir=f"./knowledge-base/{knowledgeBaseName}/text")
            print("Initialized the index successfully")
        else:
            vector_index = load_index_from_storage(
                StorageContext.from_defaults(persist_dir=f"./knowledge-base/{knowledgeBaseName}/text"),
            )
            init_documents = SimpleDirectoryReader(input_files = saved_files).load_data(show_progress=True)
            for doc in init_documents:
                vector_index.insert(doc)
            vector_index.storage_context.persist(persist_dir=f"./knowledge-base/{knowledgeBaseName}/text")
            print("updated the index successfully")
        
        return jsonify({"code": 0,"message": "成功处理文件完成,包括:分块，向量化,并创建索引","data":{}}), 200
    elif processMode == 'textImg':
        # 初始化参数
        vector_db_path = f"./vectorDB/{knowledgeBaseName}"
        text_collection_name = f"text_collection_{knowledgeBaseName}"
        image_collection_name = f"image_collection_{knowledgeBaseName}"
        # 初始化Qdrant客户端
        client = qdrant_client.QdrantClient(path = vector_db_path)
        # 检查集合是否存在
        existing_collections = client.get_collections().collections
        text_exists = any(col.name == text_collection_name for col in existing_collections)
        image_exists = any(col.name == image_collection_name for col in existing_collections)
        storage_dir = f"./knowledge-base/{knowledgeBaseName}/textimg"
        persist_exists = os.path.exists(storage_dir)

        # 创建或加载索引
        if text_exists and image_exists and persist_exists:
            print("检测到现有存储，准备增量更新...")
            print("加载存储上下文")
            storage_context = StorageContext.from_defaults(
                persist_dir=storage_dir,
                vector_store=QdrantVectorStore(client=client, collection_name=text_collection_name),
                image_store=QdrantVectorStore(client=client, collection_name=image_collection_name)
            )
            
            # 加载索引
            index = load_index_from_storage(
                storage_context,
                image_store=QdrantVectorStore(client=client, collection_name=image_collection_name)
            )
            
            # 加载新文档
            new_documents = SimpleDirectoryReader(input_files=saved_files).load_data(show_progress=True)
            
            # 增量插入新文档
            for doc in new_documents:
                index.insert(doc)
            
            print("完成增量更新")
        else:
            print("未检测到现有存储，创建新索引...")
            # 创建新的向量存储
            text_store = QdrantVectorStore(client=client, collection_name=text_collection_name)
            image_store = QdrantVectorStore(client=client, collection_name=image_collection_name)
            
            # 初始化存储上下文
            storage_context = StorageContext.from_defaults(
                vector_store=text_store,
                image_store=image_store
            )
            
            # 加载文档并创建索引
            documents = SimpleDirectoryReader(input_files=saved_files).load_data(show_progress=True)
            index = MultiModalVectorStoreIndex.from_documents(
                documents,
                storage_context=storage_context,
                image_embed_model=ClipEmbedding(),  # 确保ClipEmbedding已正确实现
                show_progress=True
            )
            
            print("完成索引创建")

        # 持久化存储
        #storage_context.persist(persist_dir=storage_dir)
        client.close()
        print("存储持久化完成")
        '''
        image_embed_model = ClipEmbedding()
        # Create the MultiModal index
        #documents = SimpleDirectoryReader(f"./uploads/{knowledgeBaseName}").load_data(show_progress=True)
        documents = SimpleDirectoryReader(input_files= saved_files).load_data(show_progress=True)
        index = MultiModalVectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context,
            image_embed_model=image_embed_model,
            show_progress=True,
        )
        print("finished in creating index")
        #Save it
        index.storage_context.persist(persist_dir = persist_dir)
        print("finished in saving the index")
        #Load it
        #storage_context = StorageContext.from_defaults(
        #     vector_store=text_store, persist_dir=f"./storage/{knowledgeBaseName}"
        #)
        #index = load_index_from_storage(storage_context, image_store=image_store)
        #https://docs.llamaindex.ai/en/logan-material_docs/examples/multi_modal/ollama_cookbook/
        '''
        return jsonify({"code": 0,"message": "成功处理文件(文本+图片)完成,包括:分块，向量化,并创建索引","data":{}}), 200
    ##except Exception as e:
    ##    print(f'exception--------{str(e)}')
    ##    return jsonify({"code":result,"message": str(e),"data":{}}), 400


@app.route('/api/vrv-rag/connect-db', methods=['POST'])
def database_query():
    data = request.json
    knowledgeBaseName = data.get('knowledgeBaseName')
    knowledgeBaseDesc = data.get('knowledgeBaseDesc')
    dbType = data.get('dbType')
    user = data.get('dbUser', '')
    password = data.get('dbPassword', '')
    host = data.get('dbUrl', '')
    port = data.get('dbPort', '5432')
    dbname = data.get('dbName')
    print('data:',data)
    try:
        if not is_empty(dbname):
            print('dbname:',dbname)
            connection = psycopg2.connect(user=user, password=password, host=host, port=port, dbname=dbname)
            tables = get_tables(connection)
            tablesWithColumns = []
            for table in tables:
                db_conn = psycopg2.connect(user=user, password=password, host=host, port=port, dbname=dbname)
                columns = fetch_columns(db_conn, dbname, table)
                tablesWithColumns.append({"table": table, "columns": columns})
            response = {"code":0,"message": f"Successfully connected to {dbname}", "databases":[{"database":dbname,"tables": tables,"columns": tablesWithColumns}]}
        else:
            print('dbname is empty')
            connection = psycopg2.connect(user=user, password=password, host=host, port=port)
            databases = get_databases(connection)
            db_info = []
            for db in databases:
                db_conn = psycopg2.connect(user=user, password=password, host=host, port=port, dbname=db)

                tables = get_tables(db_conn, db)
                tablesWithColumns = []
                for table in tables:
                    db_con= psycopg2.connect(user=user, password=password, host=host, port=port, dbname=db)
                    columns = fetch_columns(db_con, db, table)
                    tablesWithColumns.append({"table": table, "columns": columns})
                db_info.append({"database":db,"tables": tables, "columns": tablesWithColumns})
                db_conn.close()
            response = {"code":0,"message": "Successfully connected without specifying dbname", "databases": db_info}

        connection.close()
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"code":-1,"error": str(e)}), 400

'''
知识图谱中数据库类型知识库信息配置接口
'''
@app.route('/api/vrv-rag/knowledgegraph/prepare', methods=['POST'])
def connect_db():
    data = request.json
    knowledgeKBName = data.get('knowledgeKBName')
    question = data.get('user_query')
    llmModelName = data.get('llm_model_name')
    embedModelName = data.get('embedding_model_name')
    promptTemplate = data.get('promptTemplate')
    print('data:', data)
    try:
        Settings.llm ,Settings.embed_model = init_llm_and_embed_in_Ollama(llmModelName, 0.2, embedModelName)
        
        documents = SimpleDirectoryReader(
            input_dir = f"./uploads/{knowledgeKBName}"
        ).load_data(show_progress=True)
        Settings.chunk_size = 512
        graph_store = SimpleGraphStore()
        print('开始graph_store')
        storage_context = StorageContext.from_defaults(graph_store=graph_store)
        print('结束graph_store')
        index = KnowledgeGraphIndex.from_documents(
            documents,
            max_triplets_per_chunk=2,
            storage_context=storage_context,
            include_embeddings=True,
            show_progress=True,
        )
        print('结束KnowledgeGraphIndex索引创建')
        
        query_engine = index.as_query_engine(
            include_text=False, 
            response_mode="tree_summarize",
            #embedding_mode="hybrid",
            #similarity_top_k=5,
        )
        print('结束query_engine创建')
        response = query_engine.query(question)
        print('response.__dict__', response.__dict__)
        print(response)
        
        #生成知识图谱
        g = index.get_networkx_graph()
        net = Network(notebook=True, cdn_resources="in_line", directed=True,)
        net.from_nx(g)
        html_content = net.generate_html()
        folder_path = os.path.join("knowledge-graph", knowledgeKBName, f"{knowledgeKBName}.html")
        os.makedirs(os.path.dirname(folder_path), exist_ok=True)
        #folder_path = os.path.join("static", f"{knowledgeKBName}.html")
        with open(folder_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return jsonify({"code":0,"message": "Successfully processed","response": response.response,"html_file": f"{knowledgeKBName}.html"}), 200
    except Exception as error :
        print("错误:", error)
        return jsonify({"code":-1,"message": str(error)}), 400
'''
知识库中数据库类型知识库信息配置接口
'''
@app.route('/api/vrv-rag/database/prepare', methods=['POST'])
def connect():
    data = request.json
    knowledgeBaseName = data.get('knowledgeBaseName')
    knowledgeBaseDesc = data.get('knowledgeBaseDesc')
    dbType = data.get('dbType')
    user = data.get('dbUser', '')
    password = data.get('dbPassword', '')
    host = data.get('dbUrl', '')
    port = data.get('dbPort', '5432')
    dbname = data.get('dbName')
    userQuery = data.get('user_query')
    sql_tables = data.get('tableNames') #可选参数 指定需要分析的表（可选，不指定则自动分析所有表）
    contextStr = data.get('context_str') # 可选参数
    promptTemplate = data.get('promptTemplate') # 可选参数
    llmName = data.get('llm_model_name') # 可选参数
    print('data:',data)
    try:
        if not is_empty(llmName):
            #Settings.llm, Settings.embed_model = init_llm_and_embed_in_Ollama(llmName, 0.7, "quentinz/bge-large-zh-v1.5:latest")
            Settings.llm = init_llm_in_Ollama(llmName, 0.2)
        '''
        db_prefix = None
        if dbType == 'Postgres':
            db_prefix = 'postgresql+psycopg2'
        engine = create_engine(f"{db_prefix}://{user}:{password}@{host}:{port}/{dbname}")
        sql_database = SQLDatabase(engine)'
        '''
        sql_database = initDatabase(dbType, host, port, dbname, user, password)
        custom_prompt = None
        if is_empty(promptTemplate):
            custom_prompt = PromptTemplate(
                """你是一个 PostgreSQL 专家。根据以下表结构：
                {schema}
                问题：{query_str}
                请生成一个安全的 SQL 查询，避免使用 JOIN 除非必要，并优先使用 CTE（WITH 子句）。
                """
            )
        else:
            custom_prompt = PromptTemplate(promptTemplate)
        
        query_engine = create_NL2SQL_query_engine(sql_database, sql_tables, contextStr, custom_prompt)
        resp = query_engine.query(userQuery)
        processed_response = []
        for node in resp.source_nodes:  # 遍历每个 NodeWithScore 对象
            if isinstance(node, NodeWithScore):
                processed_response.append({
                    "text": node.node.text,  # 提取文本内容
                    "score": node.score,     # 提取相关性分数
                    # 可添加其他需要的字段
                })
            else:
                processed_response.append(node)  # 非 NodeWithScore 对象直接保留
        #print('dir(resp):',dir(resp)) 
        #print('response.__dict__:', resp.__dict__)
        print("生成的 SQL:", resp.metadata["sql_query"])
        print("自然语言回答:", resp)
        response = {"code":0,"message": "Successfully connected without specifying dbname", "TSql": resp.metadata["sql_query"]} #,"response": processed_response
        
        #创建知识库相关本地存储
        full_path = os.path.join(current_path, "knowledge-base", f"{knowledgeBaseName}")
        os.makedirs(full_path, exist_ok=True)
        file_path = os.path.join(full_path, f"{knowledgeBaseName}.json")
        #json_obj = json.loads(data)
        with open(file_path, mode='w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        return jsonify(response), 200
    except Exception as e:
        print(f"错误: {e}")
        if hasattr(e, 'metadata'):
            print("生成的有问题 SQL:", e.metadata.get("sql_query", "无"))
        return jsonify({"code":-1,"message": str(e)}), 400

@app.route('/api/vrv-rag/database/sqlchat', methods=['POST'])
def chat_sql():
    data = request.json
    knowledgeBaseName = data.get('knowledgeBaseName')
    knowledgeBaseDesc = data.get('knowledgeBaseDesc')
    dbType = data.get('dbType')
    user = data.get('dbUser', '')
    password = data.get('dbPassword', '')
    host = data.get('dbUrl', '')
    port = data.get('dbPort', '5432')
    dbname = data.get('dbName')
    userQuery = data.get('user_query')
    sql_tables = data.get('tableNames') #可选参数 指定需要分析的表（可选，不指定则自动分析所有表）
    contextStr = data.get('context_str') # 可选参数
    promptTemplate = data.get('promptTemplate') # 可选参数
    llmModelName = data.get('llm_model_name') # 可选参数
    print('data:',data)
    try:
        if not is_empty(llmModelName):
            Settings.llm = Ollama(
                            model= llmModelName,
                            request_timeout=600.0,
                            temperature= 0.2,
                            base_url="http://127.0.0.1:11434",
                            stream = True,
                        )
        custom_prompt = None
        if is_empty(promptTemplate):
            custom_prompt = PromptTemplate(
                """你是一个 PostgreSQL 专家。根据以下表结构：
                {schema}
                问题：{query_str}
                请生成一个安全的 SQL 查询，避免使用 JOIN 除非必要，并优先使用 CTE（WITH 子句）。
                """
            )
        else:
            custom_prompt = PromptTemplate(promptTemplate)

        file_path = os.path.join(current_path,"knowledge-base",f"{knowledgeBaseName}", f'{knowledgeBaseName}.json')
        print('file_path:',file_path)
        #if os.path.exists(file_path) :
        #    params_data = read_json(file_path)
        #    print('params_data-user:',params_data['dbUser'])
        #    sql_database = initDatabase(params_data['dbType'], params_data['dbUrl'], params_data['dbPort'], 
        #                                params_data['dbName'], params_data['dbUser'], params_data['dbPassword'])
        #    query_engine = create_NL2SQL_query_engine(sql_database, params_data['tableNames'], 
        #                                                params_data['context_str'], custom_prompt)
        #else:
        print('params_data-params-user:',user)
        sql_database = initDatabase(dbType, host, port, dbname, user, password)
        query_engine = create_NL2SQL_query_engine(sql_database, sql_tables, contextStr, custom_prompt)
        resp = query_engine.query(userQuery)
        print('response.__dict__:', resp.__dict__)
        print("自然语言回答resp:", resp)
        print("生成的 SQL:", resp.metadata["sql_query"])
        result = None
        try:
            response = {"code":0,"message": "Successfully connected without specifying dbname", "TSql": resp.metadata["sql_query"],"response": resp.response}
            result = jsonify(response)
            result1 = str(resp)
            print('result1-str(resp):',result1)
        except Exception as e:
            print('错误:', e)
            response = {"code":0,"message": "Successfully connected without specifying dbname", "response": resp.metadata["sql_query"]}
            result = jsonify(response)

        #print('dir(resp):',dir(resp)) 
        #print('response.__dict__:', resp.__dict__)
        #print("自然语言回答resp:", resp)
        #print("生成的 SQL:", resp.metadata["sql_query"])
        #print("自然语言回答resp.response:", str(resp.response).replace('`', ''))
        #print("自然语言回答[]:",processed_response)
        #print('resp.metadata:',resp.metadata)
    
        return result, 200
    except Exception as e:
        print(f"错误: {e}")
        if hasattr(e, 'metadata'):
            print("生成的有问题 SQL:", e.metadata.get("sql_query", "无"))
        return jsonify({"code":-1,"message": str(e)}), 400

'''
问答接口，被前端问答页面中的发送提交请求按钮调用
'''
@app.route('/api/vrv-rag/chat', methods=['POST'])
def chat_docs_stream():
    result = -1
    post_body_json_data = request.get_json()
    knowledgeBaseName = post_body_json_data['knowledge_base_name']
    llmModelName = post_body_json_data['llm_model_name']
    similarityTopK = post_body_json_data['similarity_top_k']
    query = post_body_json_data.get('question', '')
    print('post_body_json_data:', post_body_json_data)

    vector_index = None
    try:
        if not is_empty(llmModelName):
            Settings.llm = Ollama(
                            model= llmModelName,
                            request_timeout=600.0,
                            temperature= 0.7,
                            base_url="http://127.0.0.1:11434",
                            stream = True,
                        )

        if os.path.exists(f"./knowledge-base/{knowledgeBaseName}/text"):
            vector_index = load_index_from_storage(
                StorageContext.from_defaults(persist_dir=f"./knowledge-base/{knowledgeBaseName}/text"),
            )
            print(f'vector_index is loaded from "./knowledge-base/{knowledgeBaseName}/text successfully!')
        else:
            return jsonify({"code":result,"message": "知识库不存在，请先处理文件或重新创建知识库","data":{}}), 401
        # 手动执行检索验证
        retriever = vector_index.as_retriever(similarity_top_k=3)
        retrieved_nodes = retriever.retrieve(query)
        print("检索到的节点:", retrieved_nodes)
        print(f'llmModelName:{llmModelName}, similarityTopK:{similarityTopK}, knowledgeBaseName:{knowledgeBaseName}')
        # 自定义提示模板
        qa_prompt = PromptTemplate(
            "Context:\n{context_str}\n\nQuestion: {query_str}\nAnswer:"
        )
        # 创建流式聊天引擎
        chat_engine = vector_index.as_chat_engine(similarity_to_k = similarityTopK,
                                                  #text_qa_template=qa_prompt,
                                                  #node_postprocessors=[
                                                  #                      MetadataReplacementPostProcessor(target_metadata_key="source")  # 替换为实际元数据键
                                                  #                      ],
                                                  #include_source_nodes=True,  # 关键参数：显式包含源节点
                                                  chat_mode="condense_question",
                                                )
       
        response_stream = chat_engine.stream_chat(query)
        #response_stream.print_response_stream()
        #print(f'The response is {response_stream}')
        #print(f'The response.response is {response_stream.response}')
        #扫描RAG的响应 ,收集溯源信息
        response_pdf_page_number = []
        # 等待流式响应完成（假设流已结束）
        #print("来源节点:", response_stream.source_nodes)

        # 如果仍为空，尝试强制刷新响应对象
        #if not response_stream.source_nodes:
        #    response_stream._get_source_nodes()  # 内部方法，慎用
        #    print("强制刷新后的来源节点:", response_stream.source_nodes)

        for node in response_stream.source_nodes:
            print("-----")
            text_fmt = node.node.get_content().strip().replace("\n", " ")[:1000]
            print(f"Text:\t {text_fmt} ...")
            print(f"Metadata:\t {node.node.metadata}")
            metadata_ = node.node.metadata
            print(f"Score:\t {node.score:.3f}")
            if metadata_['file_type'] == "application/pdf":
                response_pdf_page_number.append({'file_name': metadata_['file_name'],
                                                "file_path": metadata_['file_path'],
                                                "file_type": metadata_['file_type'],
                                                'page_number': metadata_['page_label'],
                                                "score": node.score})
            else:
                response_pdf_page_number.append({'file_name': metadata_['file_name'],
                                                "file_path": metadata_['file_path'],
                                                "file_type": metadata_['file_type'],
                                                'page_number': 0,
                                                "score": node.score})
        initial_data = {"cited_documents": response_pdf_page_number}
        print('initial_data:',initial_data)
        # 流式生成响应
        def generate():
            #先返回溯源文档相关信息
            initial_data_str = json.dumps(initial_data)
            #print("Initial Data JSON验证：", json.loads(initial_data_str))  # 验证可解析性
            yield f"INITIAL:{initial_data_str}\n\n"

            #再流式返回RAG的响应
            for token in chat_engine.stream_chat(query).response_gen:
                chunk_str = str(token)
                #print("原始内容:", chunk_str)  # 调试输出实际内容
                data_msg = f"DATA:{json.dumps({'chunk': chunk_str}, ensure_ascii=False)}\n\n"
                #print("序列化后:", data_msg)  # 检查转码结果
                yield data_msg
               
            # 结束标记
            end_msg = "END:\n\n"
            #print("发送结束标记:", end_msg)  # 调试输出
            yield "END:\n\n"

        return Response(generate(), 
                        mimetype='text/event-stream; charset=utf-8', 
                        headers={
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive'
                            }
                        )
    except Exception as e:
        print(f'exception--------{str(e)}')
        return jsonify({"code":result,"message": str(e),"data":{}}), 400

@app.route('/api/vrv-rag/multimodal/chat', methods=['POST'])
def multi_modal_chat():
    try:
        data = request.get_json()
        query = data.get('question', '')
        knowledgeBaseName = data.get('knowledge_base_name')
        mmModelName = data.get('mm_model_name')
        mmModelTemprature = data.get('mm_model_temprature')
        print('data:', data)

        mm_model = OllamaMultiModal(model = mmModelName, temperature = mmModelTemprature,request_timeout = 600.0)
        # 初始化参数
        vector_db_path = f"./vectorDB/{knowledgeBaseName}-"
        text_collection_name = f"text_collection_{knowledgeBaseName}"
        image_collection_name = f"image_collection_{knowledgeBaseName}"
        # 初始化Qdrant客户端
        #client = qdrant_client.QdrantClient(path = vector_db_path)
        # 检查集合是否存在
        #existing_collections = client.get_collections().collections
        #text_exists = any(col.name == text_collection_name for col in existing_collections)
        #image_exists = any(col.name == image_collection_name for col in existing_collections)
        storage_dir = f"./knowledge-base/{knowledgeBaseName}/textimg"
        persist_exists = os.path.exists(storage_dir)
        #print('text_exists:',text_exists)
        #print('image_exists:',image_exists)
        #print('persist_exists:',persist_exists)
        # 创建或加载索引
        #if not text_exists or not image_exists or persist_exists:
        #    return jsonify({"code": -1 ,"message": "指定知识库中没有任何数据，请切换或重新建知识库","initial_data": {},"response": {}}), 200

        # Create a local Qdrant vector store
        client = qdrant_client.QdrantClient(path=vector_db_path)

        text_store = QdrantVectorStore(
            client=client, collection_name="text_collection"
        )
        image_store = QdrantVectorStore(
            client=client, collection_name="image_collection"
        )
        storage_context = StorageContext.from_defaults(
            vector_store=text_store, image_store=image_store
        )

        image_embed_model = ClipEmbedding()

        # Create the MultiModal index
        documents = SimpleDirectoryReader(f"./uploads/{knowledgeBaseName}/").load_data()
        index = MultiModalVectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context,
            image_embed_model=image_embed_model,
        )

        print("finished in loading index successfully")
        index.storage_context.persist(persist_dir=storage_dir)
        print(f"finished in saving the index to {storage_dir}")
        #Load it
        #storage_context = StorageContext.from_defaults(
        #     vector_store=text_store, persist_dir=f"./storage/{knowledgeBaseName}"
        #)
        #index = load_index_from_storage(storage_context, image_store=image_store)
        #https://docs.llamaindex.ai/en/logan-material_docs/examples/multi_modal/ollama_cookbook/
        qa_tmpl_str = (
            "Context information is below.\n"
            "---------------------\n"
            "{context_str}\n"
            "---------------------\n"
            "Given the context information and not prior knowledge, "
            "answer the query.\n"
            "Query: {query_str}\n"
            "Answer: "
        )
        qa_tmpl = PromptTemplate(qa_tmpl_str)
        #print("started to create the query engine")
        query_engine = index.as_query_engine(llm=mm_model, text_qa_template=qa_tmpl)
        #print("finished in creating the query engine")
        response = query_engine.query(query)
        #print('response.__dict__:', response.__dict__)
        response_pdf_page_number = []
        for node in response.source_nodes:
            print("-----")
            text_fmt = node.node.get_content().strip().replace("\n", " ")[:1000]
            print(f"Text:\t {text_fmt} ...")
            print(f"Metadata:\t {node.node.metadata}")
            metadata_ = node.node.metadata
            print(f"Score:\t {node.score:.3f}")
            if metadata_['file_type'] == "application/pdf":
                response_pdf_page_number.append({'file_name': metadata_['file_name'],
                                                "file_path": metadata_['file_path'],
                                                "file_type": metadata_['file_type'],
                                                'page_number': metadata_['page_label'],
                                                "score": node.score})
            else:
                response_pdf_page_number.append({'file_name': metadata_['file_name'],
                                                "file_path": metadata_['file_path'],
                                                "file_type": metadata_['file_type'],
                                                'page_number': 0,
                                                "score": node.score})
        initial_data = {"cited_documents": response_pdf_page_number}
        initial_data_str = json.dumps(initial_data)

        print(str(response))
        return jsonify({"code":0,"message": "success","initial_data": initial_data_str,"response": response.response}), 200
    except Exception as e:
        print(f'exception--------{str(e)}')
        return jsonify({"code":-1,"message": str(e),"data":{}}), 400

@app.route('/api/vrv-rag/extra/webpages', methods=['POST'])
def extra_data_web_pages():
    try:
        data = request.get_json()
        knowledgeBaseName = data.get('knowledgeBaseName')
        #knowledgeBaseDesc = data.get('knowledgeBaseDesc')
        question = data.get('user_query')
        webPageULRs = data.get('extra_web_page_urls', '')
        llmModeName = data.get('llm_model_name', '')
        llmModeTemperature = data.get('llm_model_temperature', '')
        print('data:',data)
        documents = url_to_document(webPageULRs[0])
        index = VectorStoreIndex.from_documents(documents, show_progress=True)
        Settings.llm = init_llm_in_Ollama(llmModeName, llmModeTemperature)
        query_engine = index.as_query_engine(llm = Settings.llm)

        # 执行查询
        response = query_engine.query(question)
        print('response.__dict__:', response.__dict__)
        print(response)
        return jsonify({"code":0,"message": "success","response":response.response}), 200
    except Exception as e:
        print("extra/webpages-error:",e)
        return jsonify({"code":-1,"message": "failed","data":{}}), 400

def initDatabase(dbType, host, port, dbname, user, password):
    db_prefix = None
    if dbType == 'Postgres':
        db_prefix = 'postgresql+psycopg2'
    engine = create_engine(f"{db_prefix}://{user}:{password}@{host}:{port}/{dbname}")
    sql_database = SQLDatabase(engine)
    return sql_database
def create_NL2SQL_query_engine(sql_database, sql_tables, contextStr, custom_prompt):
    if not is_empty(contextStr) and not is_empty(sql_tables):
            print("database/query case: 1")
            query_engine = NLSQLTableQueryEngine(
                    sql_database, 
                    tables=sql_tables,
                    context_str = contextStr,
                    text_to_sql_prompt = custom_prompt,
                    synthesize_response = True,# 是否将结果转换成自然语言
                
                ) 
    elif is_empty(sql_tables) and not is_empty(contextStr):
        print("database/query case: 2")
        query_engine = NLSQLTableQueryEngine(
            sql_database, 
            text_to_sql_prompt = custom_prompt,
            context_str = contextStr,
            synthesize_response = True,
            )
    elif not is_empty(sql_tables) and is_empty(contextStr):
            print("database/query case: 3")
            query_engine = NLSQLTableQueryEngine(
            sql_database, 
            tables = sql_tables,
            text_to_sql_prompt = custom_prompt,
            synthesize_response = True,
            ) 
    else:
        print("database/query case: 4")
        query_engine = NLSQLTableQueryEngine(
            sql_database, 
            text_to_sql_prompt = custom_prompt,
            synthesize_response = True,
            )
    return query_engine

def is_file_in_folder(folder_path, file_name):
    """
    判断指定文件夹下是否存在某个文件。
    
    :param folder_path: 文件夹路径
    :param file_name: 要查找的文件名
    :return: 如果文件存在返回 True，否则返回 False
    """
    folder = Path(folder_path)
    if folder.exists() and folder.is_dir():
        return (folder / file_name).is_file()
    return False

@app.route('/')
def home():
    return render_template('vrv-rag.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/modelsMgr.html')
def modelsMgr():
    return render_template('modelsMgr.html')

@app.route('/knowledgeGraphMgr.html')
def knowledgeGraphMgr():
    return render_template('knowledgeGraphMgr.html')

@app.route('/knowledgeGraphConfig.html')
def knowledgeGraphConfig():
    return render_template('knowledgeGraphConfig.html')

@app.route('/knowledgeGraphSettings.html')
def knowledgeGraphSettings():
    return render_template('knowledgeGraphSettings.html')

@app.route('/knowledgeBaseMgr.html')
def knowledgeBaseMgr():
    return render_template('knowledgeBaseMgr.html')

@app.route('/knowledgeBaseConfig.html')
def knowledgeBaseConfig():
    return render_template('knowledgeBaseConfig.html')

@app.route('/uploadFiles.html')
def uploadFiles():
    whoInvoked = request.args.get('whoInvoked')
    #print('param:', whoInvoked)
    return render_template('uploadFiles.html', param = whoInvoked)

@app.route('/ragSettings.html')
def ragSettings():
    return render_template('ragSettings.html')

@app.route('/connectDB.html')
def connectDB():
    return render_template('connectDB.html')

@app.route('/database.html')
def database():
    return render_template('database.html')

@app.route('/knowledgeResList.html')
def knowledgeResList():
    return render_template('knowledgeResList.html')

@app.route('/extralResources.html')
def extralResources():
    return render_template('extralResources.html')
@app.route('/agentMgr.html')
def agentMgr():
    return render_template('agentMgr.html')

@app.route('/historysessionlist')
def historysessionlist():
    return render_template('historysessionlist.html')

@app.route('/historysessions')
def historysessions():
    return render_template('historysessions.html')

@app.route('/newsession.html')
def newsession():
    return render_template('newsession.html')

@app.route('/sysSettings.html')
def sysSettings():
    return render_template('sysSettings.html')

@app.route('/evaluations.html')
def evaluations():
    return render_template('evaluations.html')

@app.route('/helpDoc.html')
def helpDoc():
    return render_template('helpDoc.html')

@app.route('/files/kg/<path:knowledgeGraphName>/<path:filename>')
def kbHTMLfiles(knowledgeGraphName, filename):
    return send_from_directory(f'knowledge-graph/{knowledgeGraphName}', filename)

@app.route('/files/<path:knowledgebasename>/<path:filename>')
def filelist(knowledgebasename, filename):
    return send_from_directory(f'uploads/{knowledgebasename}', filename)

def validate_params(params):
    """参数验证"""
    try:
        chunkSize = int(params.get('chunk_size', 512, type=int))
        chunkOverlap = int(params.get('chunk_overlap', 80, type=int))
        similarityTopK = int(params.get('similarity_top_k', 5, type=int))
        embedModelName = str(params.get('embedding_model_name', default="bge-large:latest", type=str))
        knowledgeBaseName = str(params.get('knowledge_base_name', default="我的档案", type=str))
        if chunkSize < 0 or  chunkOverlap < 0 or similarityTopK < 0 or embedModelName is None or knowledgeBaseName is None or chunkOverlap >= chunkSize:
            raise ValueError("Invalid chunk parameters")
        return True, None
    except Exception as e:
        return False, str(e)

def get_databases(conn):
    """Fetch all databases"""
    with conn.cursor() as cursor:
        cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        dbs = [db[0] for db in cursor.fetchall()]
    return dbs

def get_tables(conn, dbname=None):
    """Fetch all tables in a given database or the current one"""
    try:
        with conn.cursor() as cursor:
            if dbname:
                cursor.execute(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_catalog=%s",
                    (dbname,)
                )
            else:
                cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
            tables = [table[0] for table in cursor.fetchall()]
        return tables
    except Exception as e:
        return str(e)

def fetch_columns(conn, dbname, table):
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_catalog=%s AND table_name=%s",
                           (dbname, table))
            columns = cursor.fetchall()
            return [column[0] for column in columns]
            #print(f'table:{table} columns: {columns}')
        #return columns
    except Exception as e:
        return str(e)
  
def is_empty(var):
    if var is None:
        return True
    if isinstance(var, (str, list, dict, tuple, set)):
        return len(var) == 0
    return False

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)