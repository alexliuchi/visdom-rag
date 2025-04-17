let knowledgeGraphDataList = [
    { id: 1, title: "创建知识图谱", description: "导入您自己的文本数据","description_1":"",
      config: {
          "docs":{ 
            "chunk_size": 512,
            "chunk_overlap": 80,
            "embedding_model_name": "bge-large:latest",
            "similarity_top_k": 5
          },
          "database":{

          },
      }
    },
    { id: 2, title: "实境智慧产品规划", description: "40012 文件 129GB","description_1":"知识图谱备注说明:在您想在寻找相关与XXXX的信息是有用",
        config: {
            "docs":{},
            "database":{},
        }
    }
];

function initKnowledgeGraphList(knowledgeGraphDataList, knowledgeGraphContainer){
    knowledgeGraphContainer.innerHTML = '';
    knowledgeGraphDataList.forEach((item,index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = (index === 0) ? 'knowledge-graph-list-item_disabled':'knowledge-graph-list-item';
        itemDiv.dataset.itemId = item.id;
        const row1 = document.createElement('div');
        row1.className = 'knowledge-graph-list-row1';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-folder';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'row1-text';
        titleSpan.textContent = item.title;
        row1.appendChild(icon);
        row1.appendChild(titleSpan);
        const row2 = document.createElement('div');
        row2.className = 'knowledge-graph-list-row2';
        row2.textContent = item.description;
        const row3 = document.createElement('div');
        row3.className = 'knowledge-graph-list-row3';
        row3.textContent = item.description_1;
        itemDiv.appendChild(row1);
        itemDiv.appendChild(row2);
        itemDiv.appendChild(row3);

        itemDiv.addEventListener('click', function() {
                // 移除所有项目的选中状态
                document.querySelectorAll('.knowledge-graph-list-item').forEach(el => {
                    el.classList.remove('selected');
                });
                // 添加当前项目的选中状态
                this.classList.add('selected');
                
                if(item.id === 1){//创建知识库
                    console.log('创建知识图谱');
                    openConfigKnowledgeGraphUI();
                }else{
                    console.log('修改知识图谱');
                }
            });

        if(item.id !== 1){
            itemDiv.style.backgroundColor = '';
        }else{
            icon.classList.remove("fa-solid");
            icon.classList.remove("fa-folder");
            icon.classList.add("fas");
            icon.classList.add("fa-plus");
        }
        icon.style.backgroundColor = "white";
        icon.style.color = "#0066CC";

        knowledgeGraphContainer.appendChild(itemDiv); 
    });
}