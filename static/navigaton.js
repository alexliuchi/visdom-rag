// navigation.js
var navigationHTML = `
<div id="navegationContainer">
        <div id="navegationMenus">
            <div class="breadcrumb"></div>
            <div class="menu-container"></div>
        </div>
        <div id="navegationTabs">
            <div class="tabs">
                <button class="tab-link active" data-tab="tab1">Tab 1</button>
                <button class="tab-link" data-tab="tab2">Tab 2</button>
                <button class="tab-link" data-tab="tab3">Tab 3</button>
                <button class="tab-link" data-tab="tab4">Tab 4</button>
                <button class="tab-link" data-tab="tab5">Tab 5</button>
            </div>
            <div class="tab-content active" id="tab1">内容 1</div>
            <div class="tab-content" id="tab2">内容 2</div>
            <div class="tab-content" id="tab3">内容 3</div>
            <div class="tab-content" id="tab4">内容 4</div>
            <div class="tab-content" id="tab5">内容 5</div>
        </div>
</div>
`;


// 导航菜单数据
let menuData = [
    {
        name: "知识库"
    }
];

//if(document.getElementById("main-content-navigation")){
//    document.getElementById("main-content-navigation").innerHTML = navigationHTML;
//    console.log("navigation loaded:",document.getElementById("main-content-navigation").innerHTML);
//}


let currentMenu = menuData;
const pathHistory = [];

function renderMenu(menu, title) {
    const breadcrumb = document.querySelector('.breadcrumb');
    const container = document.querySelector('.menu-container');
    
    // 更新路径历史
    if (title) pathHistory.push(title);
    
    // 生成面包屑导航
    breadcrumb.innerHTML = pathHistory
        .map((item, index) => `<a onclick="navigateTo(${index})">${item}</a>`)
        .join(' > ') || '主菜单';

    // 清空当前菜单
    container.innerHTML = '';

    // 添加返回主菜单按钮
    if (pathHistory.length > 0) {
        const mainMenuBtn = document.createElement('button');
        mainMenuBtn.textContent = "主菜单";
        mainMenuBtn.onclick = () => {
            currentMenu = menuData;
            pathHistory.length = 0;
            renderMenu(menuData);
        };
        container.appendChild(mainMenuBtn);
    }

    // 生成菜单按钮
    menu.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.name;
        if (item.children) {
            btn.onclick = () => {
                currentMenu = item.children;
                renderMenu(item.children, item.name);
            };
        } else {
            btn.onclick = () => {
                console.log("执行操作:", item.name);
            };
        }
        container.appendChild(btn);
    });
    console.log('Path History:', pathHistory);
    console.log('breadcrumb:',breadcrumb.innerHTML);
    console.log('menu-container:',container.innerHTML);
}

function navigateTo(level) {
    // 重置到指定层级
    pathHistory.length = level + 1;
    let tempMenu = menuData;
    
    // 遍历到目标层级
    for (let i = 0; i <= level; i++) {
        const target = pathHistory[i];
        const found = tempMenu.find(item => item.name === target);
        if (found && found.children) tempMenu = found.children;
    }
    
    renderMenu(tempMenu);
}

// 选项卡功能
document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        const newTabId =tabId+'Content'
        // 移除所有激活状态
        document.querySelectorAll('.tab-link, .tab-content').forEach(el => {
            el.classList.remove('active');
        });
        
        // 激活当前选项卡
        tab.classList.add('active');
        document.getElementById(newTabId).classList.add('active');
    });
});