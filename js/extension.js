import { api } from "../../scripts/api.js";
import { app } from "../../scripts/app.js";


app.registerExtension({
    name: "ComfyUI-Easyai",
    async setup() {
        const menu = document.querySelector(".comfy-menu");

        const upload = () => {
            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = 999;
            document.body.appendChild(overlay);

            // 创建对话框
            const dialog = document.createElement('div');
            dialog.style.position = 'fixed';
            dialog.style.top = '50%';
            dialog.style.left = '50%';
            dialog.style.transform = 'translate(-50%, -50%)';
            dialog.style.backgroundColor = 'black';  // 设置背景为黑色
            dialog.style.color = 'white';  // 设置文字为白色
            dialog.style.padding = '20px';
            dialog.style.width = '300px';
            dialog.style.zIndex = 1000;
            document.body.appendChild(dialog);

            // 添加标题
            const title = document.createElement('h3');
            title.innerText = '确认上传？';
            title.style.color = 'white'; // 白色标题
            dialog.appendChild(title);

            // 添加域名输入框标签
            const domainLabel = document.createElement('label');
            domainLabel.setAttribute('for', 'domainInput');
            domainLabel.innerText = 'Domain (域名):';
            domainLabel.style.color = 'white'; // 白色标签文字
            dialog.appendChild(domainLabel);

            // 添加域名输入框
            const domainInput = document.createElement('input');
            domainInput.type = 'text';
            domainInput.id = 'domainInput';
            domainInput.style.width = '100%';
            domainInput.style.padding = '8px';
            domainInput.style.margin = '10px 0';
            domainInput.style.borderRadius = '4px';
            domainInput.style.border = '1px solid #ccc';
            domainInput.style.backgroundColor = '#333'; // 设置输入框背景为深灰色
            domainInput.style.color = 'white';  // 输入框文字为白色
            dialog.appendChild(domainInput);

            // 检查 localStorage 是否已有 Domain，如果有则填充输入框
            const savedDomain = localStorage.getItem('easyai-domain');
            if (savedDomain) {
                domainInput.value = savedDomain;
            }

            // 添加 API Key 输入框标签
            const label = document.createElement('label');
            label.setAttribute('for', 'apiKeyInput');
            label.innerText = 'Key:';
            label.style.color = 'white'; // 白色标签文字
            dialog.appendChild(label);

            // 添加 API Key 输入框
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'apiKeyInput';
            input.style.width = '100%';
            input.style.padding = '8px';
            input.style.margin = '10px 0';
            input.style.borderRadius = '4px';
            input.style.border = '1px solid #ccc';
            input.style.backgroundColor = '#333'; // 设置输入框背景为深灰色
            input.style.color = 'white';  // 输入框文字为白色
            dialog.appendChild(input);

            // 检查 localStorage 是否已有 API key，如果有则填充输入框
            const savedApiKey = localStorage.getItem('easyai-x-comfy-api-key');
            if (savedApiKey) {
                input.value = savedApiKey;
            }

            // 添加作品名称输入框标签
            const projectNameLabel = document.createElement('label');
            projectNameLabel.setAttribute('for', 'projectNameInput');
            projectNameLabel.innerText = 'Easyai 作品名称:';
            projectNameLabel.style.color = 'white'; // 白色标签文字
            dialog.appendChild(projectNameLabel);

            // 添加作品名称输入框
            const projectNameInput = document.createElement('input');
            projectNameInput.type = 'text';
            projectNameInput.id = 'projectNameInput';
            projectNameInput.style.width = '100%';
            projectNameInput.style.padding = '8px';
            projectNameInput.style.margin = '10px 0';
            projectNameInput.style.borderRadius = '4px';
            projectNameInput.style.border = '1px solid #ccc';
            projectNameInput.style.backgroundColor = '#333'; // 设置输入框背景为深灰色
            projectNameInput.style.color = 'white';  // 输入框文字为白色
            dialog.appendChild(projectNameInput);

            // 检查 localStorage 是否已有 作品名称，如果有则填充输入框
            const savedProjectName = localStorage.getItem('easyai-project-name');
            if (savedProjectName) {
                projectNameInput.value = savedProjectName;
            }

            // 添加确认按钮
            const saveButton = document.createElement('button');
            saveButton.innerText = '确认';
            saveButton.style.padding = '8px 12px';
            saveButton.style.backgroundColor = '#4CAF50';
            saveButton.style.color = 'white'; // 按钮文字为白色
            saveButton.style.border = 'none';
            saveButton.style.borderRadius = '4px';
            saveButton.style.cursor = 'pointer';
            dialog.appendChild(saveButton);

            // 添加取消按钮
            const cancelButton = document.createElement('button');
            cancelButton.innerText = '取消';
            cancelButton.style.padding = '8px 12px';
            cancelButton.style.backgroundColor = '#f44336';
            cancelButton.style.color = 'white'; // 按钮文字为白色
            cancelButton.style.border = 'none';
            cancelButton.style.borderRadius = '4px';
            cancelButton.style.cursor = 'pointer';
            cancelButton.style.marginLeft = '10px';
            dialog.appendChild(cancelButton);

            saveButton.onclick = () => {
                const apiKey = input.value;
                const domain = domainInput.value;
                const projectName = projectNameInput.value;

                if (apiKey && domain && projectName) {
                    // 保存 API key, domain, 作品名称到 localStorage
                    localStorage.setItem('easyai-x-comfy-api-key', apiKey);
                    localStorage.setItem('easyai-domain', domain);
                    localStorage.setItem('easyai-project-name', projectName);

                    closeDialog();

                    app.graphToPrompt().then((p2) => {
                        localStorage.setItem('easyai-x-comfy-api-key', apiKey);
                        localStorage.setItem('easyai-domain', domain);
                        app.graphToPrompt().then((p2) => {
                            const workflow = JSON.stringify(p2.output, null, 2);
                            api.fetchApi('/easyai/upload_workflow', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    domain,
                                    apiKey,
                                    workflow,
                                    name: projectName
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.error) {
                                        console.error('Error uploading workflow:', data.error);
                                        alert('Failed to upload workflow.');
                                    } else {
                                        console.log('Workflow upload successful:', data);
                                        alert('Workflow uploaded successfully!');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error uploading workflow:', error);
                                    alert('Failed to upload workflow.');
                                });
                        });
                    });
                } else {
                    alert("请输入有效的 API Key, 域名, 和作品名称.");
                }
            };

            cancelButton.onclick = () => {
                closeDialog();
            };

            function closeDialog() {
                document.body.removeChild(dialog);
                document.body.removeChild(overlay);
            }
        };

        try {
			let cmGroup = new (await import("../../scripts/ui/components/buttonGroup.js")).ComfyButtonGroup(
				new(await import("../../scripts/ui/components/button.js")).ComfyButton({
					icon: "upload",
					action: upload,
					tooltip: "上传Easyai"
				}).element
			);

			app.menu?.settingsGroup.element.after(cmGroup.element);
		}
		catch(exception) {
			console.log('ComfyUI is outdated. New style menu based features are disabled.');
		}

        const uploadEasyaiButton = document.createElement("button");
        uploadEasyaiButton.id = "uploadEasyaiButton";
        uploadEasyaiButton.textContent = "上传Easyai";
        // 点击按钮时弹出对话框
        uploadEasyaiButton.onclick = upload;

        uploadEasyaiButton.style.background = "linear-gradient(135deg, #8A00FF 0%, #00FFC6 100%)";
        uploadEasyaiButton.style.color = "black";
        uploadEasyaiButton.style.display = "inline-block";

        menu.append(uploadEasyaiButton);
    }
});