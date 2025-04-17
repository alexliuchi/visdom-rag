from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

def init_llm_and_embed_in_Ollama(llmName, llmTemperature, embedModelName):
    llm = Ollama(
        model= llmName,
        request_timeout=600.0,
        temperature= llmTemperature,
        base_url="http://127.0.0.1:11434"
    )

    embed_model = OllamaEmbedding(
            model_name= embedModelName,
            base_url='http://localhost:11434',
            request_timeout=600.0,
            #ollama_additional_kwargs={"mirostat": 0},
    )

    return llm, embed_model

def init_llm_in_Ollama(llmName, llmTemperature):
    llm = Ollama(
        model= llmName,
        request_timeout=600.0,
        temperature= llmTemperature,
        base_url="http://127.0.0.1:11434"
    )

    return llm

def init_embed_in_Ollama(embedModelName):
    embed_model = OllamaEmbedding(
            model_name= embedModelName,
            base_url='http://localhost:11434',
            request_timeout=600.0,
            #ollama_additional_kwargs={"mirostat": 0},
    )

    return embed_model

def get_model_dimension(embed_model):
    example_text = "example text"
    embedding = embed_model.get_text_embedding(example_text)

    # 获取嵌入维度
    embedding_dimension = len(embedding)
    return embedding_dimension

if __name__ == "__main__":
    print(get_model_dimension(init_embed_in_Ollama("quentinz/bge-large-zh-v1.5:latest")))