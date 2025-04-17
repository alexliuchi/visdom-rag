from llama_index.core import VectorStoreIndex
#pip install lama-index-readers-web
#from llama_index.readers.web import SimpleWebPageReader
import random
import time
from init_models import init_llm_and_embed_in_Ollama

import requests
from llama_index.core import Document, Settings

Settings.llm, Settings.embed_model = init_llm_and_embed_in_Ollama("deepseek-r1:1.5b", 0.2, "quentinz/bge-large-zh-v1.5:latest")

def get_web_page_content_by_request(url):
    response = requests.get(url) #需自行处理登录逻辑后传递 HTML 内容。
    text_content = response.text  # 或使用 BeautifulSoup 提取正文
    documents = [Document(text=text_content)]
    return documents
def get_web_page_content_by_PlaywrightWebReader(url):
    print('')
    #loader = PlaywrightWebReader()#
    #documents = loader.load_data(urls=[url])
    #return documents
def get_page_content(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Referer': 'https://www.google.com'
    }
    response = requests.get(url, headers=headers)
    return [Document(text=response.text)]
# ----------------------------
# 方法2：手动使用 Selenium + BeautifulSoup
# ----------------------------

from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

def manual_crawler(url):
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
    ]
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # 无头模式
    options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    driver = webdriver.Chrome(options=options)
    driver.get(url)
    
    try:
        # 使用显式等待确保元素加载
        main_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "main"))
        )
        main_content = main_element.text
    except TimeoutException:
        main_content = "未找到main标签内容"
    finally:
        driver.quit()
    
    return [Document(text=main_content)]

def url_to_document(url):
    # 设置 User-Agent 列表，用于随机选择
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59"
    ]
    
    # 设置 Selenium WebDriver 的选项
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # 无头模式
    options.add_argument(f"user-agent={random.choice(user_agents)}")  # 随机选择 User-Agent
    
    # 设置代理（如果需要）
    # proxies = ['proxy1', 'proxy2', 'proxy3']
    # options.add_argument(f'--proxy-server={random.choice(proxies)}')
    
    # 创建 WebDriver 实例
    driver = webdriver.Chrome(options=options)
    
    try:
        # 访问 URL
        driver.get(url)
        
        # 等待页面加载完成，可以使用显式等待
        try:
            # 等待特定元素加载，例如 <main> 标签
            main_element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            # 获取页面内容
            page_content = main_element.get_attribute('outerHTML')
        except TimeoutException:
            # 如果超时，获取整个页面内容
            page_content = driver.page_source
        
        # 使用 BeautifulSoup 解析页面内容
        soup = BeautifulSoup(page_content, 'html.parser')
        
        # 提取主要内容，可以根据实际情况调整选择器
        main_content = soup.find("main")
        if main_content is None:
            main_content = soup.find("div", class_="content")
        if main_content is None:
            main_content = soup.find("article")
        if main_content is None:
            main_content = soup.find("body")
        
        # 提取文本内容
        text_content = main_content.get_text(separator='\n', strip=True)
        
        # 创建 Document 对象
        document = Document(text=text_content)
        
        return [document]
    
    except Exception as e:
        print(f"获取页面内容时发生错误: {e}")
        return []
    
    finally:
        # 关闭浏览器
        driver.quit()

def main():
    # 初始化读取器并加载网页
    url = "https://news.sina.com.cn/zx/gj/2025-03-26/doc-ineqxyiq6151546.shtml"
    #documents = SimpleWebPageReader().load_data(urls=[url])
    #documents = get_web_page_content_by_request(url)
    # 使用示例
    #url = "https://protected-site.com"
    documents = url_to_document(url)
    # 创建索引和查询引擎
    index = VectorStoreIndex.from_documents(documents,show_progress=True)
    query_engine = index.as_query_engine()

    # 执行查询
    response = query_engine.query("网页的主要内容是什么？")
    print('response.__dict__:', response.__dict__)
    print(response)

if __name__ == "__main__":
    main()