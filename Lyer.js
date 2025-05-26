document.addEventListener('DOMContentLoaded', function() {
            const video = document.getElementById('mainVideo');
            const videoContainer = document.getElementById('videoContainer');
            const controlsContainer = document.getElementById('controlsContainer');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const progressTouchArea = document.getElementById('progressTouchArea');
            const timeDisplay = document.getElementById('timeDisplay');
            const timePreview = document.getElementById('timePreview');
            const previewLine = document.getElementById('previewLine');
            const muteBtn = document.getElementById('muteBtn');
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            const jumpForward = document.getElementById('jumpForward');
            const jumpBackward = document.getElementById('jumpBackward');
            const pulseEffect = document.getElementById('pulseEffect');
            const body = document.body;

            // تكييف الحجم للهاتف
            function adjustForMobile() {
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    document.documentElement.style.setProperty('--progress-height', '10px');
                    document.documentElement.style.setProperty('--control-height', '80px');
                    document.documentElement.style.setProperty('--touch-area-height', '40px');
                }
            }
            adjustForMobile();

            // تشغيل/إيقاف الفيديو بالنقر
            function togglePlay() {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
                showPulseEffect();
            }

            videoContainer.addEventListener('click', function(e) {
                if (!e.target.closest('.controls-container, .progress-container, .progress-touch-area, .control-btn')) {
                    togglePlay();
                }
            });

            function showPulseEffect() {
                pulseEffect.style.display = 'block';
                pulseEffect.style.animation = 'none';
                void pulseEffect.offsetWidth;
                pulseEffect.style.animation = 'pulse 0.6s ease-out forwards';
                
                setTimeout(() => {
                    pulseEffect.style.display = 'none';
                }, 600);
            }

            // النقر المزدوج للتقدم/التراجع
            let lastTap = 0;
            videoContainer.addEventListener('touchend', function(e) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < 300 && tapLength > 0) {
                    const rect = videoContainer.getBoundingClientRect();
                    const clickPosition = (e.changedTouches[0].clientX - rect.left) / rect.width;
                    
                    if (clickPosition > 0.6) {
                        video.currentTime += 10;
                        showJumpEffect(jumpForward);
                    } else if (clickPosition < 0.4) {
                        video.currentTime = Math.max(0, video.currentTime - 10);
                        showJumpEffect(jumpBackward);
                    }
                }
                lastTap = currentTime;
            });

            function showJumpEffect(element) {
                element.style.animation = 'none';
                void element.offsetWidth;
                element.style.animation = 'jumpIndicator 0.8s';
            }

            // التحكم بالسحب على شريط التقدم
            progressTouchArea.addEventListener('touchstart', handleProgressStart);
            progressTouchArea.addEventListener('mousedown', handleProgressStart);
            
            function handleProgressStart(e) {
                progressContainer.classList.add('active');
                updateProgressBar(e);
                
                document.addEventListener('mousemove', updateProgressBar);
                document.addEventListener('touchmove', updateProgressBar);
                document.addEventListener('mouseup', handleProgressEnd);
                document.addEventListener('touchend', handleProgressEnd);
            }
            
            function updateProgressBar(e) {
                const rect = progressContainer.getBoundingClientRect();
                let pos = 0;
                
                if (e.type.includes('touch')) {
                    pos = (e.touches[0].clientX - rect.left) / rect.width;
                } else {
                    pos = (e.clientX - rect.left) / rect.width;
                }
                
                pos = Math.max(0, Math.min(1, pos));
                
                // تحديث المؤشر
                const previewTime = pos * video.duration;
                timePreview.textContent = formatTime(previewTime);
                timePreview.style.left = `${pos * 100}%`;
                previewLine.style.left = `${pos * 100}%`;
                
                // إذا كان المستخدم يسحب
                if (e.type === 'mousemove' || e.type === 'touchmove') {
                    video.currentTime = previewTime;
                }
            }
            
            function handleProgressEnd(e) {
                progressContainer.classList.remove('active');
                
                document.removeEventListener('mousemove', updateProgressBar);
                document.removeEventListener('touchmove', updateProgressBar);
                document.removeEventListener('mouseup', handleProgressEnd);
                document.removeEventListener('touchend', handleProgressEnd);
            }

            // ملء الشاشة وتدوير الهاتف
            function toggleFullscreen() {
                if (!document.fullscreenElement) {
                    videoContainer.requestFullscreen()
                        .then(() => {
                            body.classList.add('fullscreen');
                            screen.orientation.lock('landscape')
                                .catch(e => console.log('Orientation lock not supported'));
                        })
                        .catch(err => console.error('Error attempting to enable fullscreen:', err));
                } else {
                    document.exitFullscreen()
                        .then(() => {
                            body.classList.remove('fullscreen');
                            screen.orientation.unlock();
                        });
                }
            }

            fullscreenBtn.addEventListener('click', toggleFullscreen);

            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement) {
                    body.classList.remove('fullscreen');
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                } else {
                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                }
            });

            // تحديث الوقت
            video.addEventListener('timeupdate', function() {
                const progress = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${progress}%`;
                timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            });

            // زر كتم الصوت
            muteBtn.addEventListener('click', function() {
                if (video.volume > 0) {
                    video.volume = 0;
                    muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    video.volume = 1;
                    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            });

            // تهيئة الوقت عند تحميل البيانات
            video.addEventListener('loadedmetadata', function() {
                timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
            });

            // تنسيق الوقت (دقائق:ثواني)
            function formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }

            // إظهار/إخفاء عناصر التحكم
            let controlsTimeout;
            function hideControls() {
                controlsTimeout = setTimeout(() => {
                    if (!video.paused) {
                        controlsContainer.style.opacity = '0';
                        progressContainer.classList.add('hidden-controls');
                    }
                }, 3000);
            }

            function showControls() {
                clearTimeout(controlsTimeout);
                controlsContainer.style.opacity = '1';
                progressContainer.classList.remove('hidden-controls');
                hideControls();
            }

            videoContainer.addEventListener('touchstart', showControls);
            videoContainer.addEventListener('mousemove', showControls);
            video.addEventListener('play', showControls);
            hideControls();
        });
