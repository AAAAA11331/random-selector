function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交换元素
    }
}

function generateColors(count) {
    let colors = [];
    let hue = Math.random() * 360; // 随机起始色相
    let saturation = 70; // 饱和度
    let lightness = 50; // 亮度

    for (let i = 0; i < count; i++) {
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        hue += (360 / count) * (Math.random() * 0.4 + 0.8); // 调整色相
        saturation += Math.random() * 10 - 5; // 轻微调整饱和度
        lightness += Math.random() * 10 - 5; // 轻微调整亮度
    }
    return colors;
}


function loadProjects() {
    const projectsData = localStorage.getItem('projects');
    return projectsData ? JSON.parse(projectsData) : [];
}

function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function parseProjectsInput(input) {
    const lines = input.split('\n');
    return lines.map(line => {
        const parts = line.split(',');
        if (parts.length < 2) {
            console.error('输入格式错误，应为项目名,人数：', line);
            return null;
        }
        return { project: parts[0].trim(), count: parseInt(parts[1].trim(), 10) };
    }).filter(Boolean);
}

function assignNames() {
    const namesInput = document.getElementById('namesInput').value.trim();
    const projectsInput = document.getElementById('projectsInput').value.trim();

    if (!namesInput || !projectsInput) {
        alert('请输入名字和项目！');
        return;
    }

    const names = namesInput.split('\n').filter(name => name.trim() !== '');
    const projects = parseProjectsInput(projectsInput);
    saveProjects(projects);

    const totalNeeded = projects.reduce((acc, project) => acc + project.count, 0);
    if (names.length < totalNeeded) {
        alert('提供的名字不足以满足所有项目的需求！');
        return;
    }

    shuffle(names);

    const colors = generateColors(names.length);
    const colorBlocksContainer = document.getElementById('colorBlocks');
    colorBlocksContainer.innerHTML = ''; // 清空颜色块容器

    let selectedNames = [];
    names.forEach((name, index) => {
        const block = document.createElement('div');
        block.className = 'color-block';
        block.innerHTML = `
            <div class="flipper">
                <div class="front">选我</div>
                <div class="back">${name}</div>
            </div>
        `;
        block.querySelector('.front').style.backgroundColor = colors[index]; // 分配颜色
        block.onclick = () => {
            if (!block.classList.contains('flipped')) {
                block.classList.add('flipped');
                selectedNames.push(name);
                if (selectedNames.length === totalNeeded) {
                    displayResults(projects, selectedNames);
                }
            }
        };
        colorBlocksContainer.appendChild(block);
    });
}

function displayResults(projects, selectedNames) {
    let currentNameIndex = 0;
    const assignment = projects.map(project => {
        const assignedNames = selectedNames.slice(currentNameIndex, currentNameIndex + project.count);
        currentNameIndex += project.count;
        return { project: project.project, names: assignedNames };
    });

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = assignment.map(item => `<p>${item.project}: ${item.names.join(', ')}</p>`).join('');
}



function loadSessions() {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    const select = document.getElementById('savedSessions');
    select.innerHTML = '<option value="">选择一个历史记录...</option>';
    for (const name in sessions) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
}

function loadSession(name) {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    if (name && sessions[name]) {
        document.getElementById('sessionName').value = name;
        document.getElementById('namesInput').value = sessions[name].names.join('\n');
        document.getElementById('projectsInput').value = sessions[name].projects.map(p => `${p.project}, ${p.count}`).join('\n');
    }
}

function saveSession() {
    const name = document.getElementById('sessionName').value.trim();
    const names = document.getElementById('namesInput').value.trim().split('\n').filter(Boolean);
    const projects = parseProjectsInput(document.getElementById('projectsInput').value.trim());

    if (!name) {
        alert('Please enter a session name.');
        return;
    }

    const sessions = JSON.parse(localStorage.getItem('sessions') || '{}');
    sessions[name] = { names, projects };
    localStorage.setItem('sessions', JSON.stringify(sessions));
    loadSessions(); // Refresh the session list
    alert('Session saved!');
}

document.addEventListener('DOMContentLoaded', function() {
    loadSessions();
});
