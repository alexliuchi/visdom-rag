document.addEventListener("DOMContentLoaded", function () {
    const data = [
      { name: "钢铁是如何练成的.docx", mode: "通用", charCount: 100, recallCount: 5, uploadTime: "2023-01-01", status: "完成","category":"文本文档" },
      { name: "我看见的世界.pdf", mode: "通用", charCount: 200, recallCount: 3, uploadTime: "2023-01-02", status: "进行中" ,"category":"文本文档"},
      { name: "黄帝内经-素问.txt", mode: "通用", charCount: 150, recallCount: 2, uploadTime: "2023-01-03", status: "待处理" ,"category":"企业数据库"},
      { name: "黄帝内经-灵枢.XLS", mode: "通用", charCount: 300, recallCount: 4, uploadTime: "2023-01-04", status: "完成"  ,"category":"企业数据库"},
      { name: "伤寒杂病论.txt", mode: "通用", charCount: 250, recallCount: 1, uploadTime: "2023-01-05", status: "进行中"  ,"category":"企业数据库"},
      { name: "毛泽东选集 第一册.HTM", mode: "模式F", charCount: 120, recallCount: 6, uploadTime: "2023-01-06", status: "待处理" ,"category":"企业数据库" },
      { name: "毛泽东选集 第一册.MDX", mode: "模式G", charCount: 180, recallCount: 7, uploadTime: "2023-01-07", status: "完成"  ,"category":"企业数据库"},
      { name: "毛泽东选集 第一册.ppt", mode: "模式H", charCount: 220, recallCount: 8, uploadTime: "2023-01-08", status: "进行中"  ,"category":"企业数据库"},
      { name: "人类简史.markdown", mode: "模式I", charCount: 280, recallCount: 9, uploadTime: "2023-01-09", status: "待处理"  ,"category":"企业数据库"},
      { name: "世界简史.CSV", mode: "模式J", charCount: 320, recallCount: 10, uploadTime: "2023-01-10", status: "完成"  ,"category":"企业数据库"},
      { name: "茶馆.XLSX", mode: "模式K", charCount: 360, recallCount: 11, uploadTime: "2023-01-11", status: "进行中"  ,"category":"企业数据库"},
      { name: "易经.HTML", mode: "通用", charCount: 400, recallCount: 12, uploadTime: "2023-01-12", status: "待处理"  ,"category":"企业数据库"},
      { name: "AttentionAllYouNeed.pdf", mode: "通用", charCount: 400, recallCount: 12, uploadTime: "2023-01-12", status: "待处理" ,"category":"企业数据库" }
    ];

    const rowsPerPage = 8;
    let currentPage = 1;
  
    function renderTable(page) {
      const tbody = document.querySelector("#knowledge-lib-doc-table-data-table tbody");
      tbody.innerHTML = "";
  
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const pageData = data.slice(start, end);
  
      pageData.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="knowledge-lib-doc-table-td">${item.name}</td>
          <td class="knowledge-lib-doc-table-td">${item.category}</td>
          <td class="knowledge-lib-doc-table-td">${item.mode}</td>
          <td class="knowledge-lib-doc-table-td">${item.charCount}</td>
          <td class="knowledge-lib-doc-table-td">${item.recallCount}</td>
          <td class="knowledge-lib-doc-table-td">${item.uploadTime}</td>
          <td class="knowledge-lib-doc-table-td">${item.status}</td>
        `;
        tbody.appendChild(row);
      });
    }
  
    function renderPagination() {
      const totalPages = Math.ceil(data.length / rowsPerPage);
      document.getElementById("page-info").textContent = `${currentPage}/${totalPages}`;
    }
  
    const prevPage = document.getElementById("prev-page");
    if(prevPage){
        document.getElementById("prev-page").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable(currentPage);
                renderPagination();
            }
        });
    }
  
    document.getElementById("next-page").addEventListener("click", () => {
      const totalPages = Math.ceil(data.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable(currentPage);
        renderPagination();
      }
    });
  
    document.getElementById("go-to-page").addEventListener("click", () => {
      const jumpPage = parseInt(document.getElementById("jump-page").value, 10);
      const totalPages = Math.ceil(data.length / rowsPerPage);
      if (jumpPage > 0 && jumpPage <= totalPages) {
        currentPage = jumpPage;
        renderTable(currentPage);
        renderPagination();
      }
    });
    /** 设置按钮点击事件 
    document.querySelector("#knowledge-lib-doc-table-data-table tbody").addEventListener("click", (e) => {
      if (e.target.classList.contains("fa-cog")) {
        const modal = document.getElementById("settings-modal");
        modal.style.display = "block";

      }
    });

    document.getElementById("knowledge-lib-doc-table-close-modal").addEventListener("click", () => {
      const modal = document.getElementById("settings-modal");
      modal.style.display = "none";
    });
    **/
    renderTable(currentPage);
    renderPagination();
  });

  // 模板参数更新
  const TEMPLATES = {
    high_quality: {
        chunk_size: 384,
        overlap: 128,
        strategy: 'hybrid'
    },
    economic: {
        chunk_size: 768,
        overlap: 64,
        strategy: 'vector'
    }
};
function showForm() {
    const button = document.getElementById("settingTriggerButton");
    const form = document.getElementById("knowledge-document-param-container1");
    if(form.style.display === "block") {
        form.style.display = "none";
    }else{

        
        // 获取按钮的位置
        const rect = button.getBoundingClientRect();

        // 设置表单位置为按钮正下方
        form.style.display = "block";
        form.style.top = `${rect.bottom + window.scrollY}px`;
        form.style.left = `${rect.left + window.scrollX}px`;
    }
}

function hideForm() {
    setTimeout(() => {
        document.getElementById("knowledge-document-param-container1").style.display = "none";
        showToast("配置信息已保存")    
    }, 1000);
    
}

function updateTemplate(value) {
    if(value !== 'custom') {
        document.getElementById('chunkSize').value = TEMPLATES[value].chunk_size;
        document.getElementById('overlap').value = TEMPLATES[value].overlap;
    }
}

// 高级参数切换
function toggleAdvanced(link) {
    const container = link.parentElement.nextElementSibling;
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    link.textContent = container.style.display === 'none' ? '显示高级参数' : '隐藏高级参数';
}

// 配置保存
function saveConfig() {
    const config = {
        chunk_size: document.getElementById('chunkSize').value,
        overlap: document.getElementById('overlap').value,
        model: document.getElementById('embeddingModel').value
    };
    showToast('配置已保存：\n' + JSON.stringify(config, null, 2));
    // 实际开发中可替换为API调用
}

const RAG_KNOWLEDGE_DOCUMENT_CONF = `
      <div class="knowledge-document-param-container">
        <!-- 分段设置 -->
        <div class="knowledge-document-config-section"">
            <div class="knowledge-document-section-title">📏 分段设置</div>
            
            <div class="knowledge-document-param-group">
                <label>块大小 (chunk_size):</label>
                <div>
                    <input class="knowledge-document-input" type="number" id="chunkSize" min="128" max="2048" step="64" value="512">
                    <div class="knowledge-document-param-hint">
                        单个文本块的最大长度，较短的块适合精准匹配，较长的块保留更多上下文
                        <div class="knowledge-document-recommendation">推荐：法律条款256 | 技术文档512 | 书籍1024</div>
                    </div>
                </div>
            </div>

            <div class="knowledge-document-param-group">
                <label>重叠长度 (overlap):</label>
                <div>
                    <input class="knowledge-document-input" type="number" id="overlap" min="0" max="512" step="32" value="128">
                    <div class="knowledge-document-param-hint">
                        相邻文本块的重叠长度，用于保持上下文连贯性
                        <div class="knowledge-document-recommendation">推荐：chunk_size的20-25%（如512→128）</div>
                    </div>
                </div>
            </div>

            <div class="knowledge-document-param-group">
                <label>预处理规则:</label>
                <div>
                    <label><input class="knowledge-document-input" type="checkbox" checked> 去除特殊字符</label>
                    <label><input class="knowledge-document-input" type="checkbox"> 保留表格结构</label>
                    <label><input class="knowledge-document-input" type="checkbox" checked> 标准化编号格式</label>
                    <div class="knowledge-document-param-hint">
                        清理文本的预处理规则，根据文档类型选择
                        <div class="knowledge-document-recommendation">技术文档：保留表格 | 合同文本：标准化编号</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 索引方式 -->
        <div class="knowledge-document-config-section"">
            <div class="knowledge-document-section-title">🔍 索引方式</div>
            
            <div class="knowledge-document-preset-template">
                <label>预设模板:</label>
                <select id="presetTemplate" onchange="updateTemplate(this.value)">
                    <option value="high_quality">高质量模板</option>
                    <option value="economic">经济型模板</option>
                    <option value="custom">自定义</option>
                </select>
                <div class="knowledge-document-param-hint">
                    预设配置模板，快速适配不同场景需求
                    <div class="knowledge-document-recommendation">高质量：精确检索 | 经济型：资源优化</div>
                </div>
                
                <div id="templateParams" style="margin-top:10px;">
                    <div class="knowledge-document-param-group">
                        <label>索引粒度:</label>
                        <select>
                            <option value="sentence">句子级</option>
                            <option value="paragraph" selected>段落级</option>
                        </select>
                        <div class="knowledge-document-param-hint">
                            索引的最小单位粒度
                            <div class="knowledge-document-recommendation">法律文本：句子级 | 技术文档：段落级</div>
                        </div>
                    </div>
                    <div class="knowledge-document-param-group">
                        <label>索引刷新频率:</label>
                        <input class="knowledge-document-input" type="number" value="60" min="10" step="5"> 分钟
                        <div class="knowledge-document-param-hint">
                            索引更新频率（分钟），高频更新保证时效性
                            <div class="knowledge-document-recommendation">实时系统：10-30分钟 | 静态文档：60+分钟</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Embedding模型 -->
        <div class="knowledge-document-config-section"">
            <div class="knowledge-document-section-title">🧠 Embedding模型</div>
            
            <div class="knowledge-document-param-group">
                <label>模型选择:</label>
                <select id="embeddingModel">
                    <option value="bge-large-zh">BGE-large-中文</option>
                    <option value="text2vec">Text2Vec-large</option>
                    <option value="custom">自定义模型</option>
                </select>
                <div class="knowledge-document-param-hint">
                    选择适合文档语言的嵌入模型
                    <div class="knowledge-document-recommendation">中文优先BGE | 多语言选Text2Vec</div>
                </div>
            </div>

            <div class="knowledge-document-param-group">
                <label>向量维度:</label>
                <div>
                    <input class="knowledge-document-input" type="number" value="768" disabled>
                    <div class="knowledge-document-param-hint">
                        嵌入向量的维度数，维度越高表征能力越强
                        <div class="knowledge-document-recommendation">通用场景768 | 专业领域1024</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 检索设置 -->
        <div class="knowledge-document-config-section"">
            <div class="knowledge-document-section-title">⚡ 检索设置</div>
            
            <div class="knowledge-document-param-group">
                <label>检索策略:</label>
                <select>
                    <option value="hybrid">混合检索（关键词+向量）</option>
                    <option value="vector">纯向量检索</option>
                    <option value="keyword">关键词检索</option>
                </select>
                <div class="knowledge-document-param-hint">
                    平衡召回率和准确性的检索策略
                    <div class="knowledge-document-recommendation">常规：混合检索 | 专业术语：关键词优先</div>
                </div>
            </div>

            <div class="knowledge-document-param-group">
                <label>返回结果数:</label>
                <input class="knowledge-document-input" type="number" min="1" max="20" value="5">
                <div class="knowledge-document-param-hint">
                    单次检索返回的最大结果数量
                    <div class="knowledge-document-recommendation">精准场景：3-5条 | 探索性检索：10+条</div>
                </div>
            </div>

            <div class="knowledge-document-param-group">
                <label>重排模型:</label>
                <select>
                    <option value="bge-reranker">BGE重排模型</option>
                    <option value="ce">Cross-Encoder</option>
                </select>
                <div class="knowledge-document-param-hint">
                    结果重排序模型，提升最终结果相关性
                    <div class="knowledge-document-recommendation">中文内容：BGE | 复杂推理：Cross-Encoder</div>
                </div>
            </div>
        </div>

        <button style="width:100%;padding:12px;background:#3498db;color:white;border:none;border-radius:4px;" 
                onclick="saveDocumentsConfig()">
            保存配置
        </button>
    </div>
    `
    const RAG_KNOWLEDGE_DOCUMENT_CONF1 = `
    <div class="knowledge-document-param-container" style="display:none;" id="knowledge-document-param-container1">
      <!-- 分段设置 -->
      <div class="knowledge-document-config-section"">
          <div class="knowledge-document-section-title">📏 分段设置</div>
          
          <div class="knowledge-document-param-group">
              <label>块大小 (chunk_size):</label>
              <div>
                  <input class="knowledge-document-input" type="number" id="chunkSize" min="128" max="2048" step="64" value="512">
                  <div class="knowledge-document-param-hint">
                      单个文本块的最大长度，较短的块适合精准匹配，较长的块保留更多上下文
                      <div class="knowledge-document-recommendation">推荐：法律条款256 | 技术文档512 | 书籍1024</div>
                  </div>
              </div>
          </div>

          <div class="knowledge-document-param-group">
              <label>重叠长度 (overlap):</label>
              <div>
                  <input class="knowledge-document-input" type="number" id="overlap" min="0" max="512" step="32" value="128">
                  <div class="knowledge-document-param-hint">
                      相邻文本块的重叠长度，用于保持上下文连贯性
                      <div class="knowledge-document-recommendation">推荐：chunk_size的20-25%（如512→128）</div>
                  </div>
              </div>
          </div>

          <div class="knowledge-document-param-group">
              <label>预处理规则:</label>
              <div>
                  <label><input class="knowledge-document-input" type="checkbox" checked> 去除特殊字符</label>
                  <label><input class="knowledge-document-input" type="checkbox"> 保留表格结构</label>
                  <label><input class="knowledge-document-input" type="checkbox" checked> 标准化编号格式</label>
                  <div class="knowledge-document-param-hint">
                      清理文本的预处理规则，根据文档类型选择
                      <div class="knowledge-document-recommendation">技术文档：保留表格 | 合同文本：标准化编号</div>
                  </div>
              </div>
          </div>
      </div>

      <!-- 索引方式 -->
      <div class="knowledge-document-config-section"">
          <div class="knowledge-document-section-title">🔍 索引方式</div>
          
          <div class="knowledge-document-preset-template">
              <label>预设模板:</label>
              <select id="presetTemplate" onchange="updateTemplate(this.value)">
                  <option value="high_quality">高质量模板</option>
                  <option value="economic">经济型模板</option>
                  <option value="custom">自定义</option>
              </select>
              <div class="knowledge-document-param-hint">
                  预设配置模板，快速适配不同场景需求
                  <div class="knowledge-document-recommendation">高质量：精确检索 | 经济型：资源优化</div>
              </div>
              
              <div id="templateParams" style="margin-top:10px;">
                  <div class="knowledge-document-param-group">
                      <label>索引粒度:</label>
                      <select>
                          <option value="sentence">句子级</option>
                          <option value="paragraph" selected>段落级</option>
                      </select>
                      <div class="knowledge-document-param-hint">
                          索引的最小单位粒度
                          <div class="knowledge-document-recommendation">法律文本：句子级 | 技术文档：段落级</div>
                      </div>
                  </div>
                  <div class="knowledge-document-param-group">
                      <label>索引刷新频率:</label>
                      <input class="knowledge-document-input" type="number" value="60" min="10" step="5"> 分钟
                      <div class="knowledge-document-param-hint">
                          索引更新频率（分钟），高频更新保证时效性
                          <div class="knowledge-document-recommendation">实时系统：10-30分钟 | 静态文档：60+分钟</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Embedding模型 -->
      <div class="knowledge-document-config-section"">
          <div class="knowledge-document-section-title">🧠 Embedding模型</div>
          
          <div class="knowledge-document-param-group">
              <label>模型选择:</label>
              <select id="embeddingModel">
                  <option value="bge-large-zh">BGE-large-中文</option>
                  <option value="text2vec">Text2Vec-large</option>
                  <option value="custom">自定义模型</option>
              </select>
              <div class="knowledge-document-param-hint">
                  选择适合文档语言的嵌入模型
                  <div class="knowledge-document-recommendation">中文优先BGE | 多语言选Text2Vec</div>
              </div>
          </div>

          <div class="knowledge-document-param-group">
              <label>向量维度:</label>
              <div>
                  <input class="knowledge-document-input" type="number" value="768" disabled>
                  <div class="knowledge-document-param-hint">
                      嵌入向量的维度数，维度越高表征能力越强
                      <div class="knowledge-document-recommendation">通用场景768 | 专业领域1024</div>
                  </div>
              </div>
          </div>
      </div>

      <!-- 检索设置 -->
      <div class="knowledge-document-config-section"">
          <div class="knowledge-document-section-title">⚡ 检索设置</div>
          
          <div class="knowledge-document-param-group">
              <label>检索策略:</label>
              <select>
                  <option value="hybrid">混合检索（关键词+向量）</option>
                  <option value="vector">纯向量检索</option>
                  <option value="keyword">关键词检索</option>
              </select>
              <div class="knowledge-document-param-hint">
                  平衡召回率和准确性的检索策略
                  <div class="knowledge-document-recommendation">常规：混合检索 | 专业术语：关键词优先</div>
              </div>
          </div>

          <div class="knowledge-document-param-group">
              <label>返回结果数:</label>
              <input class="knowledge-document-input" type="number" min="1" max="20" value="5">
              <div class="knowledge-document-param-hint">
                  单次检索返回的最大结果数量
                  <div class="knowledge-document-recommendation">精准场景：3-5条 | 探索性检索：10+条</div>
              </div>
          </div>

          <div class="knowledge-document-param-group">
              <label>重排模型:</label>
              <select>
                  <option value="bge-reranker">BGE重排模型</option>
                  <option value="ce">Cross-Encoder</option>
              </select>
              <div class="knowledge-document-param-hint">
                  结果重排序模型，提升最终结果相关性
                  <div class="knowledge-document-recommendation">中文内容：BGE | 复杂推理：Cross-Encoder</div>
              </div>
          </div>
      </div>

      <button style="width:100px;padding:12px;background:#f2f2f2;color:black;border:none;border-radius:4px;" 
              onclick="hideForm()">
          保存配置优化
      </button>
  </div>
  `
    
    let historySessions =  ` 
        <div class="message-title-container" id="messageTitleContainer">
    <p id="session-title" style="font-weight: bold;">撒旦士大夫</p>
    <input type="text" id="title-input" maxlength="30" style="display: none;">
    </div>
    <div class="message-container" id="messageContainer" style="width: 50%;">
    <div class="message-bubble user-message">撒旦士大夫</div><i class="fa-solid fa-robot" style="color: rgb(0, 102, 204);"></i><details><summary><i class="fa-solid fa-magnifying-glass" style="color: rgb(0, 102, 204);"></i> 基于6个搜索2个知识库分类搜索来源<i class="fas fa-angle-down" style="color: rgb(0, 102, 204); margin-left: 5px;"></i></summary><ul style="background-color: rgb(243, 245, 250);"><li>LNG福建福清项目总览.pdf</li><li>LNG福建福清项目环境保护标准.pdf</li><li>LNG福建福清项目罐车操作说明.ppt</li><li>LNG福建福清项目罐车操作说明.txt</li><li>LNG福建福清项目轮船卸载规范.pdf</li><li>LNG福建福清项目罐车操作说明一揽图.png</li></ul></details><div class="message-bubble bot-message">撒旦士大夫<br><br><br><div class="bot-message-bottom-container">
    <i class="fas fa-play-circle" style="marginLeft:auto;marginRight:0;color:#7D7D7D;;"></i>&nbsp;&nbsp;
    <div class="bot-message-bottom-right-icons">
    <i class="fas fa-copy" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-up" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-down" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>
    </div>
    </div></div><div class="message-bubble user-message">深度学习简介</div><i class="fa-solid fa-robot" style="color: rgb(0, 102, 204);"></i><details><summary><i class="fa-solid fa-magnifying-glass" style="color: rgb(0, 102, 204);"></i> 基于6个搜索2个知识库分类搜索来源<i class="fas fa-angle-down" style="color: rgb(0, 102, 204); margin-left: 5px;"></i></summary><ul style="background-color: rgb(243, 245, 250);"><li>LNG福建福清项目总览.pdf</li><li>LNG福建福清项目环境保护标准.pdf</li><li>LNG福建福清项目罐车操作说明.ppt</li><li>LNG福建福清项目罐车操作说明.txt</li><li>LNG福建福清项目轮船卸载规范.pdf</li><li>LNG福建福清项目罐车操作说明一揽图.png</li></ul></details><div class="message-bubble bot-message">深度学习简介<br><br><br><div class="bot-message-bottom-container">
    <i class="fas fa-play-circle" style="marginLeft:auto;marginRight:0;color:#7D7D7D;;"></i>&nbsp;&nbsp;
    <div class="bot-message-bottom-right-icons">
    <i class="fas fa-copy" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-up" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-down" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>
    </div>
    </div></div><div class="message-bubble user-message">能再深入细致地讲解下正个流程吗</div><i class="fa-solid fa-robot" style="color: rgb(0, 102, 204);"></i><details><summary><i class="fa-solid fa-magnifying-glass" style="color: rgb(0, 102, 204);"></i> 基于6个搜索2个知识库分类搜索来源<i class="fas fa-angle-down" style="color: rgb(0, 102, 204); margin-left: 5px;"></i></summary><ul style="background-color: rgb(243, 245, 250);"><li>LNG福建福清项目总览.pdf</li><li>LNG福建福清项目环境保护标准.pdf</li><li>LNG福建福清项目罐车操作说明.ppt</li><li>LNG福建福清项目罐车操作说明.txt</li><li>LNG福建福清项目轮船卸载规范.pdf</li><li>LNG福建福清项目罐车操作说明一揽图.png</li></ul></details><div class="message-bubble bot-message">能再深入细致地讲解下正个流程吗<br><br><br><div class="bot-message-bottom-container">
    <i class="fas fa-play-circle" style="marginLeft:auto;marginRight:0;color:#7D7D7D;;"></i>&nbsp;&nbsp;
    <div class="bot-message-bottom-right-icons">
    <i class="fas fa-copy" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-up" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-down" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>
    </div>
    </div></div><div class="message-bubble user-message">目前国内哪家大语言模型性能最好？</div><i class="fa-solid fa-robot" style="color: rgb(0, 102, 204);"></i><details><summary><i class="fa-solid fa-magnifying-glass" style="color: rgb(0, 102, 204);"></i> 基于6个搜索2个知识库分类搜索来源<i class="fas fa-angle-down" style="color: rgb(0, 102, 204); margin-left: 5px;"></i></summary><ul style="background-color: rgb(243, 245, 250);"><li>LNG福建福清项目总览.pdf</li><li>LNG福建福清项目环境保护标准.pdf</li><li>LNG福建福清项目罐车操作说明.ppt</li><li>LNG福建福清项目罐车操作说明.txt</li><li>LNG福建福清项目轮船卸载规范.pdf</li><li>LNG福建福清项目罐车操作说明一揽图.png</li></ul></details><div class="message-bubble bot-message">目前国内哪家大语言模型性能最好？<br><br><br><div class="bot-message-bottom-container">
    <i class="fas fa-play-circle" style="marginLeft:auto;marginRight:0;color:#7D7D7D;;"></i>&nbsp;&nbsp;
    <div class="bot-message-bottom-right-icons">
    <i class="fas fa-copy" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-up" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>&nbsp;&nbsp;
    <i class="fas fa-thumbs-down" style="marginLeft:0;marginRight:auto;color:#7D7D7D;"></i>
    </div>
    </div>
    </div>
    </div>
    <div class="input-container" style="width: 50%;">
    <textarea id="textInput" placeholder="请输入内容..."></textarea>
    <div class="button-row">
    <button id="new-send-msg-button" style="background-color: rgb(0, 102, 204);">
    <i class="fas fa-paper-plane send-icon" style="color: white;"></i>
    </button>
    <button class="scroll-button" style="display: none;">
    <i class="fas fa-chevron-down" style="color: blue; background-color: transparent;"></i>
    </button>
    </div>
    </div>
        `;
    const doc_help =`
    <h1>VRV-RAG 系统使用帮助</h1>
    <p>欢迎使用角 VRV-RAG 知识库增强检索系统，本帮助文档将指导您如何高效地使用该系统来满足您的知识检索需求。</p>

    <div class="section">
    <div class="section-header">一、系统登录</div>
    <p>使用您的企业账号登录系统。请确保您输入的账号和密码准确无误。</p>
    <p>登录地址：<a href="YOUR_SYSTEM_LOGIN_URL">YOUR_SYSTEM_LOGIN_URL</a></p>
    </div>

    <div class="section">
    <div class="section-header">二、知识库管理</div>
    <p>在使用检索功能之前，您需要确保您的知识库已正确建立和配置。</p>
    <ul>
    <li><strong>添加知识库：</strong>点击系统界面上的“添加知识库”按钮，按照提示填写知识库名称、描述等信息，并上传相关的文档资料。支持的文档格式包括但不限于 PDF、Word 文档、TXT 等。</li>
    <li><strong>编辑知识库：</strong>若需要修改已有的知识库信息，可在知识库列表中找到对应的知识库，点击“编辑”按钮进行修改。</li>
    <li><strong>删除知识库：</strong>如果您确定不再需要某个知识库，可点击知识库列表中的“删除”按钮，但请注意，此操作将永久删除该知识库及其所有相关数据，请谨慎操作。</li>
    </ul>
    </div>

    <div class="section">
    <div class="section-header">三、检索操作</div>
    <p>角 VRV-RAG 系统提供了强大的增强检索功能，帮助您快速找到所需知识。</p>
    <ol>
    <li><strong>进入检索界面：</strong>登录系统后，在主菜单中选择“知识检索”选项，进入检索界面。</li>
    <li><strong>输入检索关键词：</strong>在检索框中输入您想要查询的关键词或问题。为了获得更精准的检索结果，建议您使用具体、明确的关键词。</li>
    <li><strong>选择知识库：</strong>如果您有多个知识库，可以从下拉菜单中选择您希望检索的知识库。</li>
    <li><strong>调整检索参数（可选）：</strong>根据您的需求，您可以调整一些检索参数，如检索结果的数量、排序方式等。</li>
    <li><strong>点击检索按钮：</strong>完成上述设置后，点击“检索”按钮，系统将根据您的输入和设置进行检索。</li>
    <li><strong>查看检索结果：</strong>系统会返回与您的检索条件相关的知识片段或文档列表。您可以点击结果中的链接查看详细内容。</li>
    </ol>
    </div>

    <div class="section">
    <div class="section-header">四、结果分析与反馈</div>
    <p>系统提供了对检索结果的分析功能，帮助您更好地理解和利用检索到的知识。</p>
    <ul>
    <li><strong>结果统计：</strong>您可以查看检索结果的数量、相关度分布等统计信息，以便对检索效果有一个整体的了解。</li>
    <li><strong>反馈机制：</strong>如果您认为某个检索结果不准确或不相关，可以点击结果旁边的“反馈”按钮，向系统管理员反馈该信息，以便我们不断优化系统。</li>
    </ul>
    </div>

    <div class="section">
    <div class="section-header">五、系统设置</div>
    <p>您可以在系统设置中根据您的偏好和需求进行一些个性化配置。</p>
    <ul>
    <li><strong>界面语言：</strong>目前系统支持多种语言，您可以在设置中选择您熟悉的语言。</li>
    <li><strong>通知偏好：</strong>您可以设置是否接收系统的通知消息，以及通知的方式等。</li>
    </ul>
    </div>

    <div class="section">
    <div class="section-header">六、常见问题解答</div>
    <p>以下是一些常见问题及其解答，希望能帮助您解决使用过程中遇到的问题。</p>
    <ul>
    <li>
    <strong>问题：我无法登录系统怎么办？</strong>
    <p>请检查您的账号和密码是否正确。如果仍然无法登录，可能是您的账号被锁定或存在其他问题，请联系系统管理员。</p>
    </li>
    <li>
    <strong>问题：检索结果不准确怎么办？</strong>
    <p>您可以尝试调整检索关键词或参数，或者向我们反馈该结果，我们会尽快进行优化。</p>
    </li>
    </ul>
    </div>

    <div class="section">
    <div class="section-header">七、联系我们</div>
    <p>如果您在使用角 VRV-RAG 系统过程中有任何问题、建议或反馈，请随时与我们联系。</p>
    <p>客服邮箱：support@yourcompany.com</p>
    <p>联系电话：123-456-7890</p>
    </div>`
    const user_evaluation = `
    <table id='user_evaluation_list' style='width:80%;font-size:10px;' title="注释说明：用户使用质量评估记录表">
    <caption>
    <strong style="font-size:24px;font-weight: 700;">用户使用质量评估记录表</strong><br>
    <small style="font-size:12px">注释说明：我们会监控我们的系统对每位用户每次的问题所创建的应答,从三个核心指标:正确性(Correctness),忠诚度(Faithfulness),相关性(Relevance),使用三个不同智能体:(Agent1:Llamaindex,Agent2:DeepEval,Agent3:Uptrain)做质量评估.分值:0.00~1.00,1为最高</small>    
    </caption>
    <thead style="background-color: #F3F5FA;">
    <tr>
    <th colspan="6" style="text-align:center;font-weight: 900;">用户使用质量评估记录表</th> <!-- 使用 colspan 合并单元格 -->
    </tr>
    <tr style="font-weight: 800;">
    <th class='' style='font-weight: bold;'>用户名</th>
    <th class='' style='font-weight: bold;'>AI Agent 1</th>
    <th class='' style='font-weight: bold;'>AI Agent 2</th>
    <th class='' style='font-weight: bold;'>AI Agent 3</th>
    <th class='' style='font-weight: bold;'>详细信息</th>
    <th class='' style='font-weight: bold;'>检索问题提交时间</th>
    </tr>
    </thead>
    <tbody id='evaluation_list_body'>
    <tr>
    <th style='width:60px'>81196-少将王伟</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>    
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    <tr>
    <th style='width:60px'>梁文峰</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>    
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    <tr>
    <th style='width:60px'>王兴兴</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>    
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    <tr>
    <th style='width:60px'>杨植麟</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    <tr>
    <th style='width:60px'>稚辉君</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    <tr>
    <th style='width:60px'>雷布斯</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    <tr>
    <th style='width:60px'>雷布斯</th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:0.9</p><p>Relevance:0.9</p></th>
    <th class='' style=''><p>Correctness:1</p><p>Faithfulness:1</p><p>Relevance:1</p></th>
    <th class='' style=''>
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
        详细信息
        <div class="tooltip">
            <p>用户问题:你好吗？</p>
            <p>检索回答:还行！感谢</p>
        </div>
    </div>
    </th>
    <th class='' style=''>2025-02-28 00：00：00</th>
    </tr>
    </tbody>
    <tfoot>
    <tr>
    <td colspan="6" style="text-align: left; font-size: 12px;">
    注释说明：
    <ul>
        <li>1.忠诚度/忠实性(Faithfulness): 定义为衡量生成的答案是否忠实于检索到的上下文（context）。它关注的是答案中的信息是否完全基于检索到的内容，避免“幻觉”或生成无关信息。重要性是确保生成内容与检索到的上下文一致，防止模型编造事实。</li>
        <li>2.相关性(Relevance): 定义为衡量检索到的上下文或生成的答案是否与用户查询（query）直接相关。它关注的是检索结果是否能够满足用户的实际需求.重要性是确保检索到的信息和生成的答案与用户意图高度匹配。</li>
        <li>3.正确性(Correctness):定义为衡量生成的答案是否忠实于检索到的上下文（context）。它关注的是答案中的信息是否完全基于检索到的内容，避免“幻觉”或生成无关信息。重要性是确保生成内容无事实错误，提升用户信任。</li>
        <li>4.三者的关系与作用</li>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.1 Faithfulness 和 Correctness 是互补的：</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.1.1 Faithfulness 强调生成内容与检索到的上下文的一致性。</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.1.2 Correctness 强调生成内容是否符合真实世界的情况。</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4.2 Relevance 则从用户需求的角度出发，确保检索和生成的内容能够真正解决用户问题。</p>
    </ul>
    </td>
    </tr>
    </tfoot>
    </table>
    `;

    const sys_evaluation = `
    <table id="sys_evaluaton_list" style='width:80%;font-size:8px;' title="注释说明：系统测试质量评估记录表">
    <caption>
    <strong style="font-size:24px;font-weight: 700;">系统测试质量评估记录表</strong><br>
    <small style="font-size:12px">注释说明：系统测试质量评估相比较用户使用质量评估更全面(指标更多),更细致(涉及到智能检索系统RAG相关地层技术实现的各个环节如应用大语言模型(多个:多种:文字处理模型，多模态的图片和视觉模型，嵌入式模型(embedding model)和重排模型(rerank model)等)，对数据的向量化,存储,检索、排序、召回、消歧、融合、生成等。</small>
    </caption>
    <thead style="background-color: #F3F5FA;">
    <tr style="font-weight: 900;">
    <th colspan="6" style="font-weight: bold;">Response Evaluation</th>
    <th colspan="6" style="font-weight: bold;">Retrieval Evaluation</th>
    <th colspan="1" rowspan="2" style="font-weight: bold;">Evaluation Summary</th>
    </tr>
    <tr style="text-align: center;">
    <th>Faithfulness</th>
    <th>Relevancy</th>
    <th>Answer and Context Relevancy</th>
    <th>Guideline</th>
    <th>Correctness</th>
    <th>Semantic</th>
    <th style="">hit_rate</th>
    <th style="">mrr</th>
    <th style="">precision</th>
    <th style="">recall</th>
    <th style="">ap</th>
    <th style="">ndcg</th>
    </tr>
    </thead>
    <tbody>
    <tr style="text-align: center;">
    <td>0.786</td>
    <td>0.886</td>
    <td>0.686</td>
    <td>0.786</td>
    <td>0.894</td>
    <td>0.982</td>
    <td>1</td>
    <td>1</td>
    <td>0.667</td>
    <td>1</td>
    <td>1</td>
    <td>0.876</td>
    <td style="text-align:left;">
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
    详细信息
    <div class="tooltip">
        <p>评估标题:Word中的表格检索质量评估-1</p>
        <p>评估检索问题:50个</p>
        <p>评估对应文件:LNG储罐施工程序.docx</p>
        <p>评估使用的标记检索数据集:<a>(LabelledRagDataset)</a></p>
        <p>检索批量评估时间:2024-12-06 16:32:33</p>
        <p style="background-color:blue;color:white">状态:良好</p>
    </div>
    </div>
    </td>
    </tr>
    <tr style="text-align: center;">
    <td>0.886</td>
    <td>0.886</td>
    <td>0.686</td>
    <td>1</td>
    <td>1</td>
    <td>0.667</td>
    <td>0.876</td>
    <td>0.786</td>
    <td>1</td>
    <td>1</td>
    <td>0.894</td>
    <td>0.982</td>
    <td style="text-align:left;">
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
    详细信息
    <div class="tooltip">
        <p>评估标题:Word中的表格检索质量评估-2</p>
        <p>评估检索问题:102个</p>
        <p>评估对应文件:LNG储罐施工程序.docx;PE管焊接施工记录表.doc</p>
        <p>评估使用的标记检索数据集:<a>(LabelledRagDataset)</a></p>
        <p>检索批量评估时间:2024-12-03 15:00:03</p>
        <p style="background-color:green;color:white">状态:一般</p>  
    </div>
    </div>
    </td>
    </tr>
    <tr style="text-align: center;">
    <td>0.986</td>
    <td>0.754</td>
    <td>0.686</td>
    <td>1</td>
    <td>0.876</td>
    <td>0.786</td>
    <td>1</td>
    <td>0.667</td>
    <td>1</td>
    <td>0.894</td>
    <td>0.982</td>
    <td>1</td>
    <td style="text-align:left;">
    <div class="tooltip-container" onmouseover="adjustTooltip(this)">
    详细信息
    <div class="tooltip">
        <p>评估标题:--</p>
        <p>评估检索问题:102个</p>
        <p>评估对应文件:LNG储罐施工程序.docx;PE管焊接施工记录表.doc;LNG接收站运行仿真系统设计.doc</p>
        <p>评估使用的标记检索数据集:<a>(LabelledRagDataset)</a></p>
        <p>检索批量评估时间:2024-12-01 10:00:05</p>
        <p style="background-color:brown;color:white">状态:优秀</p>  
    </div>
    </div>
    </td>
    </tr>
    </tbody>
    <tfoot>
    <tr>
    <td colspan="13" style="text-align: center; font-size: smaller;">
    注释说明：系统测试质量评估记录表
    </td>
    </tr>
    </tfoot>
    </table>
    `;