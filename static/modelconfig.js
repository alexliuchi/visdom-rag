<!-- 配置模态窗口 -->
    <div id="configModal" class="model-config-modal">
        <div class="model-config-modal-content">
            <h3>大模型配置</h3>
            
            <div class="model-config-form-group">
                <label class="model-config-label">选择提供商：</label>
                <select class = "model-config-select" id="providerSelect" onchange="switchProvider()">
                    <option value="ollama">Ollama</option>
                    <option value="deepseek">Deepseek</option>
                    <option value="chatgpt">ChatGPT</option>
                </select>
            </div>

            <!-- Ollama 配置 -->
            <div id="ollama-config" class="model-config-section">
                <div class="model-config-form-group">
                    <label class="model-config-label">模型名称：</label>
                    <input class="model-config-input"  type="text">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">Base URL：</label>
                    <input class="model-config-input"  type="url" value="http://localhost:11434">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">Max Tokens：</label>
                    <input class="model-config-input"  type="number" value="2048">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">Keep Alive：</label>
                    <input class="model-config-input"  type="text" value="5m">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">Performance Mode：</label>
                    <select>
                        <option>Balanced</option>
                        <option>High Speed</option>
                        <option>High Accuracy</option>
                    </select>
                </div>
            </div>

            <!-- Deepseek 配置 -->
            <div id="deepseek-config" class="model-config-section">
                <div class="model-config-form-group">
                    <label class="model-config-label">API Key：</label>
                    <input class="model-config-input"  type="password">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">模型名称：</label>
                    <input class="model-config-input"  type="text" value="deepseek-chat">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">温度参数：</label>
                    <input class="model-config-input"  type="number" step="0.1" value="0.7">
                </div>
            </div>

            <!-- ChatGPT 配置 -->
            <div id="chatgpt-config" class="model-config-section">
                <div class="model-config-form-group">
                    <label class="model-config-label">API Key：</label>
                    <input class="model-config-input"  type="password">
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">模型版本：</label>
                    <select>
                        <option>gpt-4-turbo</option>
                        <option>gpt-4</option>
                        <option>gpt-3.5-turbo</option>
                    </select>
                </div>
                <div class="model-config-form-group">
                    <label class="model-config-label">代理设置：</label>
                    <input class="model-config-input"  type="text" placeholder="可选代理地址">
                </div>
            </div>

            <div class="model-config-button-group">
                <button class="model-config-button" onclick="saveConfig()">确定</button>
                <button class="model-config-button" onclick="closeConfigModal()">取消</button>
            </div>
        </div>
    </div>