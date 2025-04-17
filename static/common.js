/**
 * 克隆一个元素，并在原始元素被删除时自动使用克隆元素替换
 * 
 * @param {HTMLElement} targetElement    要克隆的目标元素
 * @param {HTMLDivElement} container     容器元素，用于保存克隆元素
 * @param {Object} eventListeners        事件监听器集合
 * @param {string} uniqueClass           用于识别克隆元素的类名称
 */
function backupElement(targetElement, container, eventListeners, uniqueClass = "backup-element") {
    let currentClone = null; // 当前克隆元素
    const originalElement = targetElement;

    // 如果 container 不存在，则创建一个容器
    if (!container) {
        container = document.createElement("div");
        container.id = "multipurposeContainer";
        document.body.appendChild(container);
        container.style.display = "none";
    }

    // 克隆原始元素
    function cloneElement() {
        const cloned = originalElement.cloneNode(true);
        cloned.style.display = "none"; // 隐藏克隆元素
        cloned.classList.add(uniqueClass); // 添加唯一类
        container.appendChild(cloned);
        return cloned;
    }

    // 绑定事件监听器
    function bindEventListeners(element) {
        for (const eventType in eventListeners) {
            const handler = eventListeners[eventType];
            if (typeof handler === 'function') {
                element.addEventListener(eventType, handler);
            }
        }
    }

    // 监听原始元素的删除
    const originalObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.removedNodes.forEach(function (node) {
                if (node === originalElement) {
                    // 启用克隆元素
                    currentClone.style.display = "block";
                    originalElement.style.display = "none";
                    console.log(`原始元素 ${originalElement.id} 被删除，切换到克隆元素！`);
                }
            });
        });
    });
    originalObserver.observe(originalElement.parentElement, { childList: true });

    // 监听克隆元素的删除
    const cloneObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.removedNodes.forEach(function (node) {
                if (node.classList.contains(uniqueClass)) {
                    // 重新克隆并激活
                    currentClone = cloneElement();
                    bindEventListeners(currentClone);
                    currentClone.style.display = "block";
                    originalElement.style.display = "none";
                    console.log("克隆元素被删除，重新生成克隆元素！");
                }
            });
        });
    });
    cloneObserver.observe(container, { childList: true });
}

// 示例事件监听器
const eventListeners = {
    click: function (event) {
        console.log("Element clicked:", event.target);
    },
    mouseover: function (event) {
        console.log("Mouse over element:", event.target);
    }
};

//Toast提示信息
function showToast(message) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toastMessage.style.display = 'block';

    // 自动隐藏 Toast
    setTimeout(() => {
        toastMessage.style.display = 'none';
    }, 3000); // 显示 3 秒后自动隐藏
}

 // 设备检测函数
 function detectDevice() {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    return isMobile ? 'mobile' : 'pc';
}
function getMaxDimensions() {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    console.log(`手机页面的最大宽度: ${maxWidth}px\n手机页面的最大高度: ${maxHeight}px`);
}

// 自动调整输入框高度
function autoExpand(textarea) {
    textarea.style.height = 'auto';
    const newHeight = Math.max(textarea.scrollHeight, 48); // 最小高度48px
    textarea.style.height = newHeight + 'px';
    
    // 同步更新容器位置
    const container = document.querySelector('.input-container');
    if(container){
        const containerHeight = container.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // 限制最大高度不超过视口的70%
        if (containerHeight > viewportHeight * 0.7) {
            textarea.style.overflowY = 'scroll';
        } else {
            textarea.style.overflowY = 'auto';
        }
    }
}