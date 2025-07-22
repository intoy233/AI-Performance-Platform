// 主题管理
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// DOM 元素
const videoElement = document.getElementById('videoElement');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const startCameraBtn = document.getElementById('startCamera');
const stopCameraBtn = document.getElementById('stopCamera');
const capturePhotoBtn = document.getElementById('capturePhoto');
const cozeIframe = document.getElementById('cozeIframe');
const iframeLoading = document.getElementById('iframeLoading');
const refreshCozeBtn = document.getElementById('refreshCoze');
const fullscreenCozeBtn = document.getElementById('fullscreenCoze');

// 全局变量
let mediaStream = null;
let currentUser = null;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTheme(); // 加载保存的主题
    initializeEventListeners();
    checkUserLoginStatus();
    initializeCozeIframe(); // 初始化Coze iframe
    handleWindowResize(); // 初始调整大小
});

// 处理窗口大小变化
function handleWindowResize() {
    // 根据窗口大小调整iframe容器高度
    const cozeContainer = document.getElementById('cozeContainer');
    if (cozeContainer) {
        // 在移动设备上增加高度
        if (window.innerWidth < 768) {
            cozeContainer.style.height = '450px';
        } else {
            cozeContainer.style.height = '400px';
        }
    }
}

// 初始化Coze iframe
function initializeCozeIframe() {
    // 显示加载动画
    if (iframeLoading) {
        iframeLoading.style.display = 'flex';
    }
    
    // 监听iframe加载事件
    if (cozeIframe) {
        cozeIframe.addEventListener('load', function() {
            // 隐藏加载动画
            if (iframeLoading) {
                iframeLoading.style.display = 'none';
            }
            // 确保iframe可以交互
            cozeIframe.style.pointerEvents = 'auto';
            console.log('Coze iframe 加载完成');
            showNotification('Coze智能体已加载', 'success');
        });
        
        // 监听iframe加载错误
        cozeIframe.addEventListener('error', function() {
            console.error('Coze iframe 加载失败');
            showNotification('Coze智能体加载失败，请检查网络连接', 'error');
        });
        
        // 刷新按钮事件
        if (refreshCozeBtn) {
            refreshCozeBtn.addEventListener('click', function() {
                // 显示加载动画
                if (iframeLoading) {
                    iframeLoading.style.display = 'flex';
                }
                // 暂时禁用iframe交互，防止在加载过程中误触
                cozeIframe.style.pointerEvents = 'none';
                // 重新加载iframe
                cozeIframe.src = cozeIframe.src;
                showNotification('正在刷新Coze智能体...', 'info');
            });
        }
        
        // 全屏按钮事件
        if (fullscreenCozeBtn) {
            fullscreenCozeBtn.addEventListener('click', function() {
                toggleFullscreen(cozeIframe);
            });
        }
    }
}

// 切换全屏显示
function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        // 进入全屏
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
        showNotification('已进入全屏模式', 'info');
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        showNotification('已退出全屏模式', 'info');
    }
}

// 检查用户登录状态
function checkUserLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        updateNavbarForLoggedInUser(user);
    }
}

// 更新导航栏显示已登录用户
function updateNavbarForLoggedInUser(user) {
    // 获取用户资料信息
    const profileData = localStorage.getItem(`profile_${user.email}`);
    const profile = profileData ? JSON.parse(profileData) : { nickname: '用户', avatar: null };
    
    const navButtons = document.querySelector('.nav-buttons');
    navButtons.innerHTML = `
        <button class="nav-btn settings-btn" title="个性化设置" onclick="window.location.href='settings.html'">
            <i class="fas fa-cog"></i>
        </button>
        <button class="user-profile-btn" onclick="window.location.href='profile.html'" title="个人信息">
            <div class="user-avatar">
                <img src="${profile.avatar || getDefaultAvatar()}" alt="用户头像" />
            </div>
            <span class="user-nickname">${profile.nickname}</span>
        </button>
        <button class="nav-btn logout-btn" onclick="handleLogout()" title="退出登录">
            <i class="fas fa-sign-out-alt"></i>
            <span>退出</span>
        </button>
    `;
    
    // 添加用户信息样式
    const style = document.createElement('style');
    style.textContent = `
        .user-profile-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 1rem;
            background: rgba(102, 126, 234, 0.1);
            border: 2px solid rgba(102, 126, 234, 0.3);
            border-radius: 25px;
            color: #667eea;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
        }
        .user-profile-btn:hover {
            background: rgba(102, 126, 234, 0.2);
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid rgba(102, 126, 234, 0.3);
            transition: border-color 0.3s ease;
        }
        .user-profile-btn:hover .user-avatar {
            border-color: #667eea;
        }
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .user-nickname {
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .logout-btn {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            border: 2px solid #dc3545;
        }
        .logout-btn:hover {
            background: #dc3545;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// 获取默认头像
function getDefaultAvatar() {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHA+dGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOC4zMyAxNSAxMiAxNUMxNS42NyAxNSAyMSAxNi4zMyAyMSAxOVpNMTIgN0MxNC43NiA3IDE3IDkuMjQgMTcgMTJWMTNIMTlWMTJDMTkgOC4xMyAxNS44NyA1IDEyIDVDOC4xMyA1IDUgOC4xMyA1IDEyVjEzSDdWMTJDNyA5LjI0IDkuMjQgNyAxMiA3WiIvPgo8L3N2Zz4KPC9zdmc+";
}

// 处理退出登录
function handleLogout() {
    localStorage.removeItem('currentUser');
    showNotification('已退出登录', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// 事件监听器初始化
function initializeEventListeners() {
    // 摄像头控制
    if (startCameraBtn) startCameraBtn.addEventListener('click', startCamera);
    if (stopCameraBtn) stopCameraBtn.addEventListener('click', stopCamera);
    if (capturePhotoBtn) capturePhotoBtn.addEventListener('click', capturePhoto);
    
    // 导航栏按钮
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    
    const registerBtn = document.querySelector('.register-btn');
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);
    
    const settingsBtn = document.querySelector('.settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', handleSettings);
    
    // 搜索功能
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.addEventListener('keypress', handleSearch);
    
    // 添加窗口大小变化监听，用于响应式调整
    window.addEventListener('resize', handleWindowResize);
}

// 摄像头功能
async function startCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        });
        
        videoElement.srcObject = mediaStream;
        videoElement.style.display = 'block';
        cameraPlaceholder.style.display = 'none';
        
        // 更新按钮状态
        startCameraBtn.style.opacity = '0.5';
        startCameraBtn.disabled = true;
        stopCameraBtn.style.opacity = '1';
        stopCameraBtn.disabled = false;
        capturePhotoBtn.style.opacity = '1';
        capturePhotoBtn.disabled = false;
        
        showNotification('摄像头已开启', 'success');
    } catch (error) {
        console.error('无法访问摄像头:', error);
        showNotification('无法访问摄像头，请检查权限设置', 'error');
    }
}

function stopCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    videoElement.style.display = 'none';
    cameraPlaceholder.style.display = 'flex';
    
    // 更新按钮状态
    startCameraBtn.style.opacity = '1';
    startCameraBtn.disabled = false;
    stopCameraBtn.style.opacity = '0.5';
    stopCameraBtn.disabled = true;
    capturePhotoBtn.style.opacity = '0.5';
    capturePhotoBtn.disabled = true;
    
    showNotification('摄像头已关闭', 'info');
}

function capturePhoto() {
    if (!mediaStream) {
        showNotification('请先开启摄像头', 'warning');
        return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    context.drawImage(videoElement, 0, 0);
    
    // 创建下载链接
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo_${new Date().getTime()}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    showNotification('照片已保存', 'success');
}

// 聊天功能
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // 添加用户消息
    addMessage(message, 'user');
    
    // 清空输入框
    messageInput.value = '';
    updateSendButtonState();
    
    // 显示正在输入状态
    const typingIndicator = addTypingIndicator();
    
    try {
        let response;
        
        if (cozeInitialized && window.cozeClient) {
            // 使用Coze智能体
            try {
                const result = await window.cozeClient.sendMessage(message);
                if (result.success) {
                    response = result.message;
                } else {
                    throw new Error(result.error || '智能体响应失败');
                }
            } catch (cozeError) {
                console.error('Coze智能体响应失败:', cozeError);
                response = '抱歉，智能体暂时无法响应，请稍后再试。';
                showNotification('智能体响应失败', 'error');
            }
        } else {
            // 降级到模拟响应
            response = await getSimulatedResponse(message);
        }
        
        // 移除正在输入指示器
        removeTypingIndicator(typingIndicator);
        
        // 添加机器人回复
        addMessage(response, 'bot');
        
    } catch (error) {
        console.error('发送消息失败:', error);
        removeTypingIndicator(typingIndicator);
        addMessage('抱歉，发生了错误，请稍后再试。', 'bot');
        showNotification('发送消息失败', 'error');
    }
}

// 获取模拟响应（降级方案）
async function getSimulatedResponse(message) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
        '我收到了您的消息，正在处理中...',
        '这是一个很有趣的问题！',
        '感谢您的输入，我会认真考虑的。',
        '您说得很对，让我想想如何回应。',
        '这个话题很有意思，我们可以深入讨论。'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// 添加正在输入指示器
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span class="typing-text">智能体正在思考...</span>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

// 移除正在输入指示器
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    // 添加时间戳
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    timestamp.style.fontSize = '0.8rem';
    timestamp.style.opacity = '0.7';
    timestamp.style.marginTop = '0.5rem';
    
    messageDiv.appendChild(timestamp);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function updateSendButtonState() {
    const hasText = messageInput.value.trim().length > 0;
    sendMessageBtn.disabled = !hasText;
    sendMessageBtn.style.opacity = hasText ? '1' : '0.5';
}

function clearChat() {
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-robot"></i>
            <p>对话已清空，您可以重新开始对话。</p>
        </div>
    `;
    showNotification('对话已清空', 'info');
}

// 其他功能
function handleAttachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            showNotification(`已选择文件: ${file.name}`, 'info');
            // 这里可以添加文件上传逻辑
        }
    };
    input.click();
}

function handleVoiceInput() {
    if (!isRecording) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
}

function startVoiceRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('您的浏览器不支持语音录制', 'error');
        return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            isRecording = true;
            voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceInputBtn.style.background = '#dc3545';
            showNotification('开始录音...', 'info');
            
            // 这里可以添加实际的语音识别逻辑
            // 目前只是模拟
        })
        .catch(error => {
            console.error('无法访问麦克风:', error);
            showNotification('无法访问麦克风，请检查权限设置', 'error');
        });
}

function stopVoiceRecording() {
    isRecording = false;
    voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceInputBtn.style.background = '';
    showNotification('录音结束', 'info');
    
    // 模拟语音识别结果
    setTimeout(() => {
        messageInput.value = '这是通过语音输入的文字（模拟）';
        updateSendButtonState();
    }, 1000);
}

// 导航栏功能
function handleLogin() {
    window.location.href = 'auth.html';
}

function handleRegister() {
    window.location.href = 'auth.html';
}

function handleSettings() {
    showNotification('设置功能开发中...', 'info');
    // 这里可以添加设置面板逻辑
}

function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            showNotification(`搜索: ${query}`, 'info');
            // 这里可以添加搜索逻辑
        }
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 获取通知图标
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info':
        default: return 'fa-info-circle';
    }
}

// 工具函数
function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden && mediaStream) {
        // 页面隐藏时暂停摄像头（可选）
        console.log('页面隐藏，摄像头继续运行');
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', function() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
});