let modelListDataSet = {
    llm:[
        { id: 1, category: "llm", title: "添加大语言模型", description: "","description_1":"配置连接自建部署的企业私有大模型或者连接大模型厂商提供的模型","toggle":"visible"},
        { id: 2, category: "llm", title: "Deep Seek V3", description: "厂商提供","description_1":"月之暗面,去年LLM领域的当红辣子鸡","toggle":"visible" },
        { id: 3, category: "llm", title: "Qwen2.5 70B", description: "私有化部署","description_1":"阿里通译千文","toggle":"visible" },
        { id: 4, category: "vlm", title: "llava:latest", description: "开源模型","description_1":"Meta的多模态模型","toggle":"hidden" },
        { id: 5, category: "vlm", title: "llava:13b", description: "开源模型","description_1":"Meta的多模态模型","toggle":"hidden" },
    ],
    embed:[
        { id: 1, category: "embed",title: "添加嵌入模型", description: "导入您自己的文本数据","description_1":"","toggle":"visible"},
        { id: 2, category: "embed",title: "quentinz/bge-large-zh-v1.5:latest", description: "BAAI","description_1":"","toggle":"hidden" }
    ],
    rerank:[
        { id: 1, category: "rerank",title: "添加重排模型", description: "导入您自己的文本数据","description_1":""},
        { id: 2, category: "rerank",title: "bge-rerank-large", description: "BAAI","description_1":"" }
    ]
};

function getModelCategory(modelName, modelListDataSet){
    for(i = 0; i < modelListDataSet.llm.length; i++){
        if (modelListDataSet.llm[i].title === modelName) {
            return modelListDataSet.llm[i].category;
        }
    }
    for(i = 0; i < modelListDataSet.embed.length; i++){
        if(modelListDataSet.embed[i].title === modelName){
            return modelListDataSet.embed[i].category;
        }
    }
    for(i = 0; i < modelListDataSet.rerank.length; i++){
        if(modelListDataSet.rerank[i].title === modelName){
            return modelListDataSet.rerank[i].category;
        }
    }
    return null;
}
function formatBytes(bytes) {
    if (!bytes) return '未知';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    for (const unit of units) {
      if (size < 1024) return `${size.toFixed(2)} ${unit}`;
      size /= 1024;
    }
    return `${size.toFixed(2)} TB`;
  }

async function getOllamaModelNames() {
    modelNames = []
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      
      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态码: ${response.status}`);
      }

      const data = await response.json();
      let numLLM = modelListDataSet.llm.length;
      data.models.forEach(model => {
        numLLM++;
        modelNames.appendChild(model.name);
      });
      print(numLLM)
    } catch (error) {
      showError(error);
    }
    
    return modelNames;
}

async function loadModels() {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      
      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态码: ${response.status}`);
      }

      const data = await response.json();
      let numLLM = modelListDataSet.llm.length;
      data.models.forEach(model => {
        numLLM++;
        modelListDataSet.llm.push({id:numLLM, title: model.name, description: +model.details?.family +"-"+model.details.parameter_size, description_1:model.details.format+"-"+model.details.model_type});
      });
      print(numLLM)
    } catch (error) {
      showError(error);
    }
}


 //prefixName liek knowledge-lib-list-, llm-list- embedding-list-, reranking-list-
 function initModelList(modelContainer, modelList, prefixName, clickEventFunction) {
    if(!modelContainer){
        return ;
    }
    modelContainer.innerHTML = '';
    modelList.forEach(item => {
        // 创建外层容器
        const itemDiv = document.createElement('div');
        itemDiv.className = prefixName + 'item';
        
        // 存储自定义数据
        itemDiv.dataset.itemId = item.id;

        // 创建第一行
        const row1 = document.createElement('div');
        row1.className = prefixName + 'row1';

        // 创建文件夹图标

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-folder';

        // 创建标题
        const titleSpan = document.createElement('span');
        titleSpan.className = prefixName + 'row1-text';
        titleSpan.textContent = item.title;

        // 组装第一行
        row1.appendChild(icon);
        row1.appendChild(titleSpan);

        // 创建第二行
        const row2 = document.createElement('div');
        row2.className = prefixName + 'row2';
        row2.textContent = item.description;
        //创建第三行
        const row3 = document.createElement('div');
        row3.className = prefixName + 'row3';
        row3.textContent = item.description_1;

        // 组装完整项目
        itemDiv.appendChild(row1);
        itemDiv.appendChild(row2);
        itemDiv.appendChild(row3);

        // 添加点击事件
        itemDiv.addEventListener('click', function() {
                // 移除所有项目的选中状态
                document.querySelectorAll('.'+ prefixName +'item').forEach(el => {
                    el.classList.remove('selected');
                });
                if(item.id === 1){
                  //openConfigModels();
                }
                // 添加当前项目的选中状态
                this.classList.add('selected');
                clickEventFunction();
        });
        if(item.id !== 1){
            itemDiv.className = prefixName + 'item';
        }else{
            itemDiv.className = 'llm-list-item_disabled';
            icon.style.backgroundColor = '#f5f5f5'
            icon.classList.remove("fa-solid");
            icon.classList.remove("fa-folder");
            icon.classList.add("fas");
            icon.classList.add("fa-plus");
        }
        icon.style.backgroundColor = "white";
        icon.style.color = "#0066CC";

        itemDiv.style.display = 'flex';
        itemDiv.style.marginLeft = '10px';

        modelContainer.appendChild(itemDiv); 
    });
}
