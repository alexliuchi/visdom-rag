const connectButton = document.getElementById('connectButton');
const databaseTableBody = document.getElementById('databaseTable').getElementsByTagName('tbody')[0];
const dbType = document.getElementById('dbType');
const dbPort = document.getElementById('dbPort');

let databases = [];
/** 
// 添加数据库连接
connectButton.addEventListener('click', () => {
    const knowledgeBaseName = document.getElementById('knowledgeBaseName').value;
    const knowledgeBaseDesc = document.getElementById('knowledgeBaseDesc').value;
    const dbName = document.getElementById('dbName').value;
    const dbType = document.getElementById('dbType').value;
    const dbUrl = document.getElementById('dbUrl').value;
    const dbPort = document.getElementById('dbPort').value;
    const dbUser = document.getElementById('dbUser').value;
    const dbPassword = document.getElementById('dbPassword').value;

    if (!knowledgeBaseName || !knowledgeBaseDesc || !dbType || !dbUrl || !dbPort || !dbUser || !dbPassword) {
        statusDiv.style.color = 'red';
        statusDiv.style.fontSize = '12px';
        statusDiv.innerHTML = '请填写必填的所有字段(除数据库名称外,都是必填字段)！';
        return;
    }

    const newDatabase = {
        id: databases.length + 1,
        name: dbName,
        type: dbType,
        url: dbUrl,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        tables: ['products', 'customers','salespeople'] // 模拟表名
    };

    databases.push(newDatabase);
    renderDatabaseList();
    statusDiv.style.color = 'black';
    statusDiv.style.fontSize = '12px';
    statusDiv.innerHTML = '数据库连接成功！';
});
**/
// 渲染数据库列表
function renderDatabaseList() {
    databaseTableBody.innerHTML = '';
    databases.forEach(db => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${db.type}</td>
            <td>${db.name}</td>
            <td>
                <select id="dbTables-${db.name}" multiple>
                    ${db.tables.map(table => `<option>${table}</option>`).join('')}
                </select>
            </td>
        `;
        //document.getElementById('dbTables').value
        databaseTableBody.appendChild(row);
    });
}

// 删除数据库连接
function confirmDelete(dbId) {
    if (confirm('确定要删除该数据库连接吗？')) {
        databases = databases.filter(db => db.id !== dbId);
        renderDatabaseList();
    }
}

dbType.addEventListener('change', () => {
    const selectedType = dbType.value;
    document.getElementById('dbUrl').value = 'localhost';
    if (selectedType === 'MySQL') {
        dbPort.value = '3306';
    }else if(selectedType === 'Postgres'){
        dbPort.value = '5432';
    }else if(selectedType === 'Oracle'){
        dbPort.value = '1521';
    }else if(selectedType === 'MongoDB'){
        dbPort.value = '27017';
    }
})