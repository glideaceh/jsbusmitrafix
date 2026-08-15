// Penambahan Style Kustom
    if (!document.getElementById('customEnhancementStyles')) {
        let style = document.createElement('style');
        style.id = 'customEnhancementStyles';
        style.innerHTML = `
            .status-ribbon-bottom-left.pending-orange { background: #f59e0b !important; color: white !important; }
            .status-ribbon-bottom-left.ditolak { background: #ef4444 !important; color: white !important; }
            
            /* Animasi dan Style Keren Tombol Salin */
            .btn-salin-keren {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 50px;
                font-size: 12px;
                margin-top: -20px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
            }
            .btn-salin-keren:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
            }
            .btn-salin-keren:active {
                transform: translateY(0) scale(0.95);
            }

            @keyframes slideDownCopy {
                0% { top: -50px; opacity: 0; transform: translateX(-50%) scale(0.9); }
                100% { top: 20px; opacity: 1; transform: translateX(-50%) scale(1); }
            }
            @keyframes slideUpCopy {
                0% { top: 20px; opacity: 1; transform: translateX(-50%) scale(1); }
                100% { top: -50px; opacity: 0; transform: translateX(-50%) scale(0.9); }
            }
        `;
        document.head.appendChild(style);
    }

    let backButtonHandlerStack = []; let isHandlingPopState = false;
    function pushBackButtonHandler(closeFunctionId) { history.pushState({ modalOpen: closeFunctionId }, "", window.location.href); backButtonHandlerStack.push(closeFunctionId); }
    function popBackButtonHandler() { if (isHandlingPopState) return;
        if (backButtonHandlerStack.length > 0) { backButtonHandlerStack.pop(); isHandlingPopState = true; history.back(); setTimeout(() => { isHandlingPopState = false; }, 100); } 
    }
    window.addEventListener('popstate', function(e) { if (isHandlingPopState) return; if (backButtonHandlerStack.length > 0) { isHandlingPopState = true; let closeFnId = backButtonHandlerStack.pop(); executeCloseFunctionById(closeFnId, true); setTimeout(() => { isHandlingPopState = false; }, 100); } });
    
    function executeCloseFunctionById(id, fromPopState = false) {
        switch(id) {
            case 'aksesKursi': closeAksesKursi(fromPopState); break;
            case 'addService': closeAddServiceAndReset(fromPopState); break;
            case 'editService': closeEditLayananForm(fromPopState); break;
            case 'pengaturanModal': closePengaturanModal(fromPopState); break;
            case 'seatCalendar': closeSeatCalendar(fromPopState); break;
            case 'editPribadi': closeEditPribadi(fromPopState); break;
            case 'editPerusahaan': closeEditPerusahaan(fromPopState); break;
            case 'regionModal': closeRegionModal(fromPopState); break;
            case 'scanner': closeScanner(fromPopState); break;
            case 'timePicker': closeTimeModal(fromPopState); break;
            case 'facilityModal': closeFacilityModal(fromPopState); break;
            case 'cropperModal': cancelCrop(fromPopState); break;
            case 'scannedTicket': closeScannedTicketDrawer(fromPopState); break;
            case 'confirmModal': closeConfirmModal(fromPopState); break;
            case 'paymentModal': closePaymentModal(fromPopState); break;
            case 'manualBookingPaymentModal': closeManualPaymentModal(fromPopState); break;
            case 'manualTicketResultModal': closeManualTicketModal(fromPopState); break;
            case 'desktopSidebar': toggleDesktopSidebar(fromPopState); break;
            case 'layananSearch': closeLayananSearch(fromPopState); break;
            case 'paymentDrawer': closePaymentDrawer(fromPopState); break;
            case 'riwayatImageModal': closeRiwayatImageModal(fromPopState); break;
            case 'topUpDrawer': closeTopUpDrawer(fromPopState); break;
            case 'mutasiSaldoModal': closeMutasiSaldo(fromPopState); break;
            case 'notifSidebar': closeNotifSidebar(fromPopState); break;
        }
    }

    const GAS_API_URL = "https://script.google.com/macros/s/AKfycbz9oI7WVGzV2nrgAyW965T_2XKw7uxHYkU13ouJVlb8iRzmnVXEPGhDvqtNjxOnKQsYLg/exec";
    let SESSION_USER = null;
    let SESSION_COMPANY = null;
    let globalRekeningList = [];
    let indonesianRegionsDatabase = []; let globalFacilitiesDatabase = [];
    let globalLayananList = []; let globalPesananList = [];
    let globalRiwayatList = [];
    let activeRegionInputTargetId = ""; let activeTimeInputTargetId = "";
    let activeFacilityTargetInput = ""; let selectedVehicleTypeName = "";
    let selectedFasilitasArray = [];
    let cropperInstance = null; let currentTargetImageId = "";
    let base64CompLogo = ""; let base64EditCompLogo = "";
    let base64ArmadaFoto = "";
    let activeLayananIndex = -1;
    let currentCalYear = new Date().getFullYear(); let currentCalMonth = new Date().getMonth();
    let oldMerkForEdit = ""; let oldJamBForEdit = "";
    let html5QrCode = null; let orderChartInstance = null;
    let customConfirmCallback = null;
    let currentPaymentOrderId = "";
    let currentPesananFilter = 'all';
    let pesananPollingInterval = null; let seatPollingInterval = null; let subscriptionCheckInterval = null;
    let realtimeSyncInterval = null;
    let globalPaketList = [];
    let subMultiplier = 1; let serverTimeDelta = 0; let selectedPaketIndex = -1;
    let _tempD = new Date();
    let currentSeatDate = new Date(_tempD.getTime() - (_tempD.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    let selectedManualSeats = [];
    let currentSeatCalYear = new Date().getFullYear();
    let currentSeatCalMonth = new Date().getMonth(); let lastGeneratedTicket = null;
    
    let globalSkemaList = [];
    let selectedSkemaValue = "";
    let selectedTopUpAmount = 0;

    function isSameDate(date1Str, date2Str) {
        if(!date1Str || !date2Str) return false;
        try {
            let d1 = new Date(date1Str);
            let d2 = new Date(date2Str);
            if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return date1Str.includes(date2Str) || date2Str.includes(date1Str);
            return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        } catch(e) { return false;
        }
    }

    async function fetchGAS(payload) {
        let r = await fetch(GAS_API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, redirect: "follow", body: JSON.stringify(payload) });
        let responseText = await r.text();
        try { return JSON.parse(responseText); } catch (error) { throw new Error("Server gagal mengembalikan format JSON yang valid.");
        }
    }

    function isKomisiScheme() {
        return SESSION_COMPANY && SESSION_COMPANY.skemaPembayaran && SESSION_COMPANY.skemaPembayaran.toLowerCase().trim() === "komisi pertransaksi";
    }

    // ================== INIT UI NOTIFIKASI ==================
    function initNotifUI() {
        let actionGroup = document.getElementById('headerActionGroup');
        let existingBellContainer = null;
        
        if (actionGroup) {
            let bells = actionGroup.querySelectorAll('.fa-bell');
            if (bells.length > 0) {
                existingBellContainer = bells[0].parentElement;
            }
        }

        if (existingBellContainer) {
            existingBellContainer.setAttribute('onclick', 'openNotifSidebar()');
            existingBellContainer.style.position = 'relative';
            existingBellContainer.style.cursor = 'pointer';
            existingBellContainer.id = 'bellNotifBtn';

            if (!document.getElementById('notifStyleExtras')) {
                let style = document.createElement('style');
                style.id = 'notifStyleExtras';
                style.innerHTML = `
                @keyframes shakeBell {
                    0% { transform: rotate(0); }
                    15% { transform: rotate(20deg); }
                    30% { transform: rotate(-20deg); }
                    45% { transform: rotate(15deg); }
                    60% { transform: rotate(-15deg); }
                    75% { transform: rotate(10deg); }
                    90% { transform: rotate(-10deg); }
                    100% { transform: rotate(0); }
                }
                @keyframes bounceBadge {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
                    40% { transform: translateY(-4px) scale(1.1); }
                    60% { transform: translateY(-2px) scale(1.05); }
                }
                .shake-anim i {
                    animation: shakeBell 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both;
                }
                .bounce-badge {
                    animation: bounceBadge 1.2s infinite;
                }
                .has-unread i {
                    color: #ef4444 !important;
                }
                `;
                document.head.appendChild(style);
            }
        }
        
        if (!document.getElementById('notifSidebarModal')) {
            let modalHTML = `
            <div class="right-sidebar" id="notifSidebarModal" style="position: fixed; top: 0; right: -500px; width: 100%; max-width: 380px; height: 100vh; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 100000; transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: -5px 0 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; border-left: 1px solid rgba(255, 255, 255, 0.5);">
                <div class="drawer-header" style="padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px">
                    <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;"><i class="fa-solid fa-bell" style="color:#0284c7; margin-right:8px;"></i> Notifikasi Pesanan</h3>
                    <button class="close-btn" onclick="closeNotifSidebar()" style="background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer; transition: 0.2s;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="drawer-body" id="notifSidebarContainer" style="padding: 15px; flex: 1; overflow-y: auto;">
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }
    
    function openNotifSidebar() { document.getElementById('notifSidebarModal').style.right = '0'; pushBackButtonHandler('notifSidebar'); renderNotifications(); }
    function closeNotifSidebar(fromPopState = false) { document.getElementById('notifSidebarModal').style.right = '-500px';
    if (!fromPopState) popBackButtonHandler(); }
    
    function renderNotifications() {
        let html = "";
        let notifs = globalPesananList.filter(o => o.role !== "Mitra" && !o.isManualLocal);

        let unreadCount = notifs.filter(o => o.notifStatus !== "terbuka").length;
        let bellBtn = document.getElementById('bellNotifBtn');
        if (bellBtn) {
            if (unreadCount > 0) {
                bellBtn.classList.add('has-unread');
            } else {
                bellBtn.classList.remove('has-unread');
            }

            let badge = document.getElementById('bellNotifBadge');
            if (unreadCount > 0) {
                if (!badge) {
                    badge = document.createElement('div');
                    badge.id = 'bellNotifBadge';
                    badge.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; font-size: 9px; font-weight: bold; padding: 2px 5px; border-radius: 10px; border: 2px solid white; z-index: 10; pointer-events: none; transition: 0.3s;';
                    bellBtn.appendChild(badge);
                }
                badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'block';
                badge.classList.add('bounce-badge');
            } else if (badge) {
                badge.style.display = 'none';
                badge.classList.remove('bounce-badge');
            }
        }

        if (notifs.length === 0) {
            html = `<div style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-regular fa-bell-slash" style="font-size:30px; margin-bottom:10px;"></i><p>Belum ada notifikasi.</p></div>`;
        } else {
            notifs.forEach(o => {
                let isBaru = o.notifStatus !== "terbuka";
                let tglOrder = o.tanggalBooking ? formatTglIndo(o.tanggalBooking) : "-";
                let rawWaktu = o.waktuPemesananDb || o.waktuPemesanan;
 
                let wktOrder = "-";
                if(rawWaktu) {
                    try { wktOrder = new Date(rawWaktu).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}); } 
                    catch(e) { wktOrder = rawWaktu.toString().split(' ')[4] || "-"; }
                }
        
                let badgeHtml = isBaru ? `<span style="background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; font-size:9px; padding:2px 8px; border-radius:12px; font-weight:800; margin-left:8px; box-shadow: 0 2px 5px rgba(239,68,68,0.3);">Baru</span>` : "";
                let cursorStyle = isBaru ? 'pointer' : 'default';
                let opacityStyle = isBaru ? '1' : '0.6';
                
                let bgStyle = isBaru ? 'rgba(255,255,255,0.9)' : 'rgba(241, 245, 249, 0.7)';
                let onClickFn = isBaru ? `onclick="handleNotifClick('${o.idBooking}')"` : ``;
                html += `
                <div class="notif-card" ${onClickFn} style="background:${bgStyle}; opacity:${opacityStyle}; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(226,232,240,0.8); border-radius:12px; padding:15px; margin-bottom:12px; cursor:${cursorStyle}; box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: 0.2s;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h4 style="margin:0; font-size:13px; font-weight:800; color:#0f172a; display:flex; align-items:center;">Pesanan Masuk ${badgeHtml}</h4>
                        <span style="font-size:10px; font-weight:700; color:#64748b;">${wktOrder} WIB</span>
                    </div>
                    <p style="margin:0; font-size:12px; color:#475569; line-height:1.6;">
                        Anda mendapat pesanan kursi <b style="color:#0284c7;">${o.nomorKursi}</b>, dari <b style="text-transform:capitalize;">${o.namaPenumpang}</b>.<br>
                        <span style="font-size:11px; font-weight:600; color:#94a3b8; display:inline-block; margin-top:6px;"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i> Berangkat: ${tglOrder}</span>
                    </p>
                </div>`;
            });
        }
        document.getElementById('notifSidebarContainer').innerHTML = html;
    }

    async function handleNotifClick(idBooking) {
        let order = globalPesananList.find(o => o.idBooking === idBooking);
        if (!order) return;
        
        order.notifStatus = "terbuka";
        renderNotifications();
        closeNotifSidebar();

        setTimeout(() => {
            document.getElementById('scannedTicketContent').innerHTML = `<div style="padding: 10px 20px 20px 20px;">${generateTicketCardHTML(order, true, 0)}</div>`;
            openScannedTicketDrawer();
        }, 300);

        try { await fetchGAS({ action: "markNotifRead", idBooking: idBooking });
        } 
        catch(e) { console.error("Gagal update read status", e);
        }
    }
    // =========================================================

    function initMutasiSaldoUI() {
        if (document.getElementById('mutasiSaldoModal')) return;
        let modalHTML = `
        <div class="right-sidebar" id="mutasiSaldoModal" style="position: fixed; top: 0; right: -500px; width: 100%; max-width: 420px; height: 100vh; background: #f8fafc; z-index: 100000; transition: right 0.3s ease; box-shadow: -5px 0 20px rgba(0,0,0,0.15); display: flex; flex-direction: column;">
            <div class="drawer-header" style="padding: 20px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;"><i class="fa-solid fa-file-invoice-dollar" style="color:#10b981; margin-right:8px;"></i> Riwayat Mutasi Saldo</h3>
                <button class="close-btn" onclick="closeMutasiSaldo()" style="background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="drawer-body" id="mutasiSaldoContainer" style="padding: 15px; flex: 1; overflow-y: auto;">
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // ================= INIT UI SIDEBAR VIEW STRUK =================
    function initRiwayatImageSidebar() {
        if (document.getElementById('riwayatSidebarModal')) return;
        let modalHTML = `
        <div class="right-sidebar" id="riwayatSidebarModal" style="position: fixed; top: 0; right: -500px; width: 100%; max-width: 420px; height: 100vh; background: #f8fafc; z-index: 100000; transition: right 0.3s ease; box-shadow: -5px 0 20px rgba(0,0,0,0.15); display: flex; flex-direction: column;">
            <div class="drawer-header" style="padding: 20px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a;"><i class="fa-solid fa-image" style="color:#0284c7; margin-right:8px;"></i> Bukti Pembayaran</h3>
                <button class="close-btn" onclick="closeRiwayatImageModal()" style="background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="drawer-body" style="padding: 15px; flex: 1; overflow-y: auto; display: flex; align-items: center; justify-content: center;">
                <img id="riwayatSidebarImg" src="" style="width: 100%; height: auto; max-height: 85vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    // ==============================================================

    function updateHeaderSchemeUI() {
        if (!SESSION_COMPANY) return;
        let labelDesk = document.getElementById('subLabelDesk'); let labelMob = document.getElementById('subLabelMob');
        let dtDesk = document.getElementById('subCountdownText'); let dtMob = document.getElementById('mobileSubCountdownText');
        let btnsRenew = document.querySelectorAll('.btn-renew');
        
        if (isKomisiScheme()) {
            if (labelDesk) labelDesk.innerText = "Total Saldo:"; if (labelMob) labelMob.innerText = "Total Saldo:";
            let saldoFormatted = formatRupiah(SESSION_COMPANY.saldo || 0);
            let colorStr = (SESSION_COMPANY.saldo < 0) ? "#ef4444" : "#10b981";
      
            if (dtDesk) { dtDesk.innerText = saldoFormatted; dtDesk.className = "sub-countdown"; dtDesk.style.color = colorStr; }
            if (dtMob) { dtMob.innerText = saldoFormatted; dtMob.className = "sub-countdown"; dtMob.style.color = colorStr; }
            btnsRenew.forEach(btn => {
                btn.innerText = "Top Up"; btn.setAttribute('onclick', 'openTopUpDrawer()');
                btn.style.background = "linear-gradient(135deg, #10b981, #059669)"; btn.style.color = "#fff"; btn.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.4)";
            });
        } else {
            btnsRenew.forEach(btn => {
                btn.setAttribute('onclick', 'showSubscriptionModal(false)'); btn.style.background = ""; btn.style.color = ""; btn.style.boxShadow = "";
            });
        }
    }

    // Copy Toast logic
    function salinRekening(norek) {
        navigator.clipboard.writeText(norek).then(() => {
            showCopyToast(norek);
        }).catch(err => {
            showAlert("Gagal", "Gagal menyalin nomor rekening.", "fa-xmark", true);
        });
    }
    function showCopyToast(norek) {
        let existing = document.getElementById('copyToastOverlay');
        if(existing) existing.remove();
        let toastHtml = `
        <div id="copyToastOverlay" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000000; display: flex; align-items: center; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); padding: 12px 24px; border-radius: 50px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: slideDownCopy 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
            <div style="width: 28px; height: 28px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-size: 14px;">
                <i class="fa-solid fa-check"></i>
            </div>
            <div>
                <p style="margin: 0; color: white; font-size: 13px; font-weight: 700;">Berhasil Disalin!</p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">Nomor Rekening: ${norek}</p>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        setTimeout(() => {
            let t = document.getElementById('copyToastOverlay');
            if(t) {
                t.style.animation = "slideUpCopy 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
                setTimeout(() => t.remove(), 400);
            }
        }, 2500);
    }

    window.onload = () => {
        initCityData();
        fetchFacilitiesData(); initTimePickerOptions(); fetchSkemaData();
        initMutasiSaldoUI();
        let savedSession = localStorage.getItem('goBorneo_partner_session');
        if(savedSession) {
            let parsed = JSON.parse(savedSession);
            SESSION_USER = parsed.user; SESSION_COMPANY = parsed.company; globalPaketList = parsed.paket || [];
            globalRekeningList = parsed.rekening || [];
            if(parsed.serverTime) serverTimeDelta = new Date(parsed.serverTime).getTime() - new Date().getTime();
            
            if (SESSION_COMPANY) {
                initNotifUI();
                populateDashboardData();
                switchPage('pageMainApp'); switchSubView('layanan'); loadLayananData();
                startSubscriptionTimer(); startRealtimeExpirySync();
                if(!pesananPollingInterval) pesananPollingInterval = setInterval(fetchPesananDataSilently, 5000);
                if(!isKomisiScheme() && isSubscriptionExpired()) { setTimeout(() => { showSubscriptionModal(true); }, 2000);
                }
            } else { switchPage('pageOnboarding');
            }
        }
    };
    function switchPage(pageId) {
        document.querySelectorAll('.page').forEach(p => { p.style.display = 'none'; p.classList.remove('active-page'); });
        let target = document.getElementById(pageId);
        if(target) { if(target.classList.contains('auth-page')) { target.style.display = 'flex'; } else { target.style.display = 'block';
        } }
        window.scrollTo(0,0);
    }

    function switchSubViewWeb(tab) { 
        switchSubView(tab); toggleDesktopSidebar();
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        let items = document.querySelectorAll('.sidebar-item'); 
        if(tab === 'layanan' && items[0]) items[0].classList.add('active'); 
        if(tab === 'pesanan' && items[1]) items[1].classList.add('active');
        if(tab === 'riwayat' && items[2]) items[2].classList.add('active');
        if(tab === 'profil' && items[3]) items[3].classList.add('active');
    }

    function switchSubView(tab) {
        document.getElementById('subLayanan').style.display = 'none'; document.getElementById('subPesanan').style.display = 'none';
        document.getElementById('subRiwayat').style.display = 'none'; document.getElementById('subProfil').style.display = 'none';
        
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        let mainHeader = document.getElementById('mainAppHeader');
        document.getElementById('headerBrandGroup').style.display = 'flex'; document.getElementById('headerActionGroup').style.display = 'flex';
        document.getElementById('headerProfileTitle').style.display = 'none';
        document.getElementById('globalHeaderTimer').style.display = 'none'; document.getElementById('mobileHeaderTimer').style.display = 'none';

        if(tab === 'layanan') {
            mainHeader.style.display = 'flex';
            document.getElementById('subLayanan').style.display = 'block';
            if(document.querySelectorAll('.nav-item')[0]) document.querySelectorAll('.nav-item')[0].classList.add('active');
            if(window.innerWidth > 768) { document.getElementById('globalHeaderTimer').style.display = 'flex';
            }
            loadLayananData();
        } else if(tab === 'pesanan') {
            mainHeader.style.display = 'none';
            document.getElementById('subPesanan').style.display = 'block';
            if(document.querySelectorAll('.nav-item')[1]) document.querySelectorAll('.nav-item')[1].classList.add('active');
            loadPesananData(); 
        } else if(tab === 'riwayat') {
            mainHeader.style.display = 'none';
            document.getElementById('subRiwayat').style.display = 'block';
            if(document.querySelectorAll('.nav-item')[2]) document.querySelectorAll('.nav-item')[2].classList.add('active');
            loadRiwayatData(); 
        } else if(tab === 'profil') {
            mainHeader.style.display = 'flex';
            document.getElementById('headerBrandGroup').style.display = 'none'; 
            document.getElementById('headerActionGroup').style.display = 'none'; document.getElementById('headerProfileTitle').style.display = 'block';
            
            if(window.innerWidth > 768) { document.getElementById('globalHeaderTimer').style.display = 'flex';
            } 
            else { document.getElementById('mobileHeaderTimer').style.display = 'flex';
            }
            
            let profSec = document.getElementById('subProfil');
            profSec.style.display = 'block'; profSec.classList.remove('fade-in-smooth'); void profSec.offsetWidth; profSec.classList.add('fade-in-smooth');
            if(document.querySelectorAll('.nav-item')[3]) document.querySelectorAll('.nav-item')[3].classList.add('active');
            setTimeout(() => { if(!orderChartInstance) initStatisticsChart(); else orderChartInstance.resize(); }, 150);
        }
        updateHeaderSchemeUI();
        window.scrollTo(0,0);
    }

    function getServerAdjustedTime() { return new Date().getTime() + serverTimeDelta;
    }

    function isSubscriptionExpired() {
        if(!SESSION_USER || !SESSION_USER.expiredAt) return true;
        let expTime = new Date(SESSION_USER.expiredAt).getTime();
        return getServerAdjustedTime() >= expTime;
    }

    function startSubscriptionTimer() {
        if(subscriptionCheckInterval) clearInterval(subscriptionCheckInterval);
        if (isKomisiScheme()) { updateHeaderSchemeUI(); return; }
        
        subscriptionCheckInterval = setInterval(() => {
            if(!SESSION_USER || !SESSION_USER.expiredAt || !SESSION_COMPANY) return;
            if (isKomisiScheme()) { updateHeaderSchemeUI(); return; }
            let timeLeft = new Date(SESSION_USER.expiredAt).getTime() - getServerAdjustedTime();
            
           
             let labelDesk = document.getElementById('subLabelDesk'); let labelMob = document.getElementById('subLabelMob');
            let dtDesk = document.getElementById('subCountdownText'); let dtMob = document.getElementById('mobileSubCountdownText');
            let btnsRenew = document.querySelectorAll('.btn-renew');
        
            if(timeLeft <= 0) {
                if(SESSION_USER.isTrial) {
                  
                    if(labelDesk) labelDesk.innerText = "Trial Habis:"; if(labelMob) labelMob.innerText = "Trial Habis:";
                } else {
                    if(labelDesk) labelDesk.innerText = "Masa Aktif:";
                    if(labelMob) labelMob.innerText = "Masa Aktif:";
                }
                dtDesk.innerText = "00:00:00";
                dtMob.innerText = "00:00:00";
                dtDesk.className = "sub-countdown near-expire"; dtMob.className = "sub-countdown near-expire";
                btnsRenew.forEach(btn => btn.innerText = SESSION_USER.isTrial ? "Berlangganan" : "Perpanjang");
                if(!document.getElementById('subscriptionOverlay').classList.contains('show')) { showSubscriptionModal(true); }
            } else {
                let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                let timeStr = days > 0 ? days + " Hari " : "";
                timeStr += hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
                dtDesk.innerText = timeStr; dtMob.innerText = timeStr;
                
                if (timeLeft < 86400000) { dtDesk.className = "sub-countdown near-expire"; dtMob.className = "sub-countdown near-expire";
                } 
                else { dtDesk.className = "sub-countdown"; dtMob.className = "sub-countdown"; }

                if (SESSION_USER.isTrial) {
                    if(labelDesk) labelDesk.innerText = "Trial Aktif:";
                    if(labelMob) labelMob.innerText = "Trial Aktif:";
                    btnsRenew.forEach(btn => btn.innerText = "Berlangganan");
                } else {
                    if(labelDesk) labelDesk.innerText = "Masa Aktif:";
                    if(labelMob) labelMob.innerText = "Masa Aktif:";
                    btnsRenew.forEach(btn => btn.innerText = "Perpanjang");
                }
            }
        }, 1000);
    }

    function startRealtimeExpirySync() {
        if(realtimeSyncInterval) clearInterval(realtimeSyncInterval);
        realtimeSyncInterval = setInterval(async () => {
            if(!SESSION_USER || !SESSION_COMPANY) return;
            try {
                let res = await fetchGAS({action: "checkExpiry", username: SESSION_USER.username});
                if(res.status === "success") {
                    if (res.skemaPembayaran) SESSION_COMPANY.skemaPembayaran = res.skemaPembayaran;
 
                    if (res.komisiRate !== undefined) SESSION_COMPANY.komisiRate = res.komisiRate;

                    if (res.saldo !== undefined) {
                        let oldSaldo = SESSION_COMPANY.saldo || 0;
                      
                        SESSION_COMPANY.saldo = res.saldo;
                     
                        if (isKomisiScheme()) {
                            if (SESSION_COMPANY.saldo > oldSaldo) {
                 
                                showAlert("Top Up Selesai", "Top up saldo telah dikonfirmasi dan ditambahkan.", "fa-wallet");
                            } else if (SESSION_COMPANY.saldo < oldSaldo) {
                                let diff = oldSaldo - SESSION_COMPANY.saldo;
                                showAlert("Pemotongan Saldo", `Transaksi masuk! Saldo terpotong otomatis Rp ${formatNumber(diff)} untuk komisi.`, "fa-file-invoice-dollar", false);
                            }
                            updateHeaderSchemeUI();
                            localStorage.setItem('goBorneo_partner_session', JSON.stringify({ 
                                user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: new Date(getServerAdjustedTime()).toISOString() 
                            }));
                            return; 
                        }
                    }

                    let oldPending = SESSION_USER.hasPendingPayment;
                    let oldTrial = SESSION_USER.isTrial;
                    let oldExpiry = new Date(SESSION_USER.expiredAt).getTime(); let newExpiry = new Date(res.expiredAt).getTime();

                    SESSION_USER.hasPendingPayment = res.hasPendingPayment; SESSION_USER.isTrial = res.isTrial;
                    if(res.serverTime) { serverTimeDelta = new Date(res.serverTime).getTime() - new Date().getTime(); }
                    
                    if (newExpiry > oldExpiry || oldPending !== res.hasPendingPayment || oldTrial !== res.isTrial) {
                        SESSION_USER.expiredAt = res.expiredAt;
                        localStorage.setItem('goBorneo_partner_session', JSON.stringify({ 
                            user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: new Date(getServerAdjustedTime()).toISOString() 
                        }));
                        if(oldTrial === true && res.isTrial === false) { document.querySelectorAll('.btn-renew').forEach(btn => btn.innerText = "Perpanjang");
                        }

                        if(document.getElementById('subscriptionOverlay').classList.contains('show')) {
                            if(!isSubscriptionExpired() && !SESSION_USER.hasPendingPayment) {
                                closeSubscriptionModal();
                                showAlert("Sukses", "Pembayaran Terkonfirmasi. Masa Aktif Diperbarui", "fa-check");
                            } else { showSubscriptionModal(isSubscriptionExpired());
                            }
                        } else if(!isSubscriptionExpired() && oldPending === true && res.hasPendingPayment === false) {
                             showAlert("Sukses", "Pembayaran Anda telah disetujui Admin", "fa-check");
                        }
                    } else { SESSION_USER.expiredAt = res.expiredAt;
                    }
                }
            } catch(e) {}
        }, 10000);
    }

    function showSubscriptionModal(isForced = false) {
        if (!SESSION_COMPANY || isKomisiScheme() || document.getElementById('pageOnboarding').style.display === 'flex' || document.getElementById('pageOnboarding').style.display === 'block') { return;
        }
        
        if(seatPollingInterval) { clearInterval(seatPollingInterval);
        seatPollingInterval = null; }
        
        let titleEl = document.getElementById('subModalTitle');
        let descEl = document.getElementById('subModalDesc');
        let iconEl = document.getElementById('subModalIcon'); let isExp = isSubscriptionExpired();
        if (SESSION_USER.hasPendingPayment) {
            document.getElementById('subPaymentForm').style.display = 'none'; document.getElementById('subPendingView').style.display = 'block';
            if(isForced && isExp) { document.getElementById('btnKeluarPending').style.display = 'block'; }
            else { document.getElementById('btnKeluarPending').style.display = 'none';
            }
        } else {
            document.getElementById('subPaymentForm').style.display = 'block';
            document.getElementById('subPendingView').style.display = 'none';
            if (isExp) {
                iconEl.className = "fa-solid fa-lock warn-icon";
                if (SESSION_USER.isTrial) {
                    titleEl.innerText = "Masa Trial Telah Habis";
                    descEl.innerText = "Masa uji coba gratis Anda berakhir. Silakan beli paket langganan.";
                } else {
                    titleEl.innerText = "Langganan Berakhir";
                    descEl.innerText = "Masa aktif Anda habis. Perpanjang untuk melanjutkan kelola armada.";
                }
            } else {
                if (SESSION_USER.isTrial) {
                    iconEl.className = "fa-solid fa-box-open warn-icon";
                    iconEl.style.color = "#3b82f6";
                    titleEl.innerText = "Berlangganan Paket"; descEl.innerText = "Ayo berlangganan. Beli paket segera, jangan tunggu masa Trial habis untuk menggunakan layanan Anda";
                } else {
                    iconEl.className = "fa-solid fa-shield-halved warn-icon";
                    iconEl.style.color = "#10b981";
                    titleEl.innerText = "Perpanjang Masa Aktif"; descEl.innerText = "Masa aktif Anda masih berlaku. Perpanjang lebih awal untuk mencegah gangguan layanan.";
                }
            }

            let optsHtml = '';
            if(globalPaketList && globalPaketList.length > 0) {
                globalPaketList.forEach((paket, idx) => { optsHtml += `<div class="custom-option" onclick="selectPaketValue(${idx}, '${paket.nama}')">${paket.nama}</div>`; });
            } else { optsHtml = `<div class="custom-option">Tidak ada paket tersedia</div>`;
            }
            
            document.getElementById('paketSelectOptions').innerHTML = optsHtml;
            if(selectedPaketIndex === -1 && globalPaketList.length > 0) { selectPaketValue(0, globalPaketList[0].nama);
            } 
            else { subMultiplier = 1; calculateSubPrice();
            }

            if (isForced && isExp) {
                document.getElementById('btnKeluarSub').style.display = 'block';
                document.getElementById('btnKembaliSub').style.display = 'none';
            } else {
                document.getElementById('btnKeluarSub').style.display = 'none';
                document.getElementById('btnKembaliSub').style.display = 'block';
            }
        }
        
        document.getElementById('subscriptionOverlay').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function selectPaketValue(index, nama) {
        selectedPaketIndex = index;
        document.getElementById('selectedPaketText').innerText = nama;
        document.getElementById('selectedPaketText').style.color = "var(--text-main)";
        document.getElementById('paketSelectOptions').classList.remove('open'); calculateSubPrice();
    }

    function closeSubscriptionModal() { document.getElementById('subscriptionOverlay').classList.remove('show'); document.body.style.overflow = '';
    }

    function updateSubQty(dir) { subMultiplier += dir; if(subMultiplier < 1) subMultiplier = 1;
    if(subMultiplier > 12) subMultiplier = 12; calculateSubPrice(); }

    function calculateSubPrice() {
        document.getElementById('subQtyValue').innerText = subMultiplier + 'x';
        if(selectedPaketIndex === -1 || !globalPaketList[selectedPaketIndex]) { document.getElementById('subTotalPrice').innerText = "Rp 0"; return;
        }
        let selectedPaket = globalPaketList[selectedPaketIndex];
        document.getElementById('subTotalPrice').innerText = formatRupiah(selectedPaket.harga * subMultiplier);
    }

    function parseDurationToDays(paketName) {
      let name = paketName.toLowerCase();
      let num = parseInt(name.replace(/[^0-9]/g, '')) || 1;
      if (name.includes("bulan")) return num * 30; if (name.includes("hari")) return num * 1;
      if (name.includes("minggu")) return num * 7; if (name.includes("tahun")) return num * 365;
      return 30;
    }

    function openPaymentProcess() {
        if(selectedPaketIndex === -1 || !globalPaketList[selectedPaketIndex]) { return showAlert("Peringatan", "Pilih paket terlebih dahulu", "fa-circle-exclamation", true);
        }
        
        let htmlRek = "";
        if(globalRekeningList.length === 0) htmlRek = "<p style='color:red;'>Data Rekening Belum Tersedia.</p>";
        else {
            globalRekeningList.forEach(rek => {
                htmlRek += `<div class="rek-card-modern" style="position:relative;">
                            <img src="${rek.logo || 'https://placehold.co/100x100?text=Bank'}" class="rek-logo" alt="Bank Logo">
                            <div class="rek-info" style="flex:1;"><h4>Bank ${rek.bank}</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                                <div>
                                    <p class="norek" style="margin:0; font-size:15px; font-weight:700; color:#1E90FF;">${rek.norek}</p>
                                    <p class="name" style="margin:2px 0 0 0; font-size:12px; color:#64748b;">a/n ${rek.atasNama}</p>
                                </div>
                                <button class="btn-salin-keren" onclick="salinRekening('${rek.norek}')" title="Salin Rekening">
                                    <i class="fa-regular fa-copy"></i> Salin
                                </button>
                            </div>
                            </div></div>`;
            });
        }
        document.getElementById('rekeningListContainer').innerHTML = htmlRek;
        
        let selectedPaket = globalPaketList[selectedPaketIndex];
        let totalPaid = selectedPaket.harga * subMultiplier;
        let totalBulan = Math.round(parseDurationToDays(selectedPaket.nama) / 30 * subMultiplier);
        if (totalBulan === 0) totalBulan = 1;

        document.getElementById('paymentSummaryBox').innerHTML = `
            <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div><p style="margin: 0 0 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">Paket Pilihan</p><p style="margin: 0; font-size: 16px; font-weight: 800; color: var(--text-main);">${totalBulan} Bulan Akses</p></div>
                <div style="text-align: right;"><p style="margin: 0 0 5px 0; font-size: 12px; color: #64748b; font-weight: 700;">Total Bayar</p><p style="margin: 0; font-size: 18px; font-weight: 900; color: #10b981;">${formatRupiah(totalPaid)}</p></div>
            </div>`;
        document.getElementById('previewPaymentStruk').style.display = 'none'; document.getElementById('previewPaymentStruk').src = '';
        document.getElementById('paymentStrukFile').value = '';
        document.getElementById('paymentDrawer').classList.add('open'); pushBackButtonHandler('paymentDrawer');
    }

    function closePaymentDrawer(fromPopState = false) { document.getElementById('paymentDrawer').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }

    function previewStrukImage(event) {
        const file = event.target.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { document.getElementById('previewPaymentStruk').src = e.target.result; document.getElementById('previewPaymentStruk').style.display = 'block'; };
        reader.readAsDataURL(file);
    }

    async function submitRealPayment() {
        let fileInput = document.getElementById('paymentStrukFile');
        if(!fileInput.files[0]) return showAlert("Wajib", "Unggah foto bukti struk pembayaran.", "fa-image", true);
        
        let selectedPaket = globalPaketList[selectedPaketIndex]; let totalPaid = selectedPaket.harga * subMultiplier;
        let totalBulan = Math.round(parseDurationToDays(selectedPaket.nama) / 30 * subMultiplier); if(totalBulan === 0) totalBulan = 1;
        
        let btn = document.getElementById('btnSubmitRealPayment');
        let oriTxt = btn.innerHTML; 
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah Struk...`; btn.disabled = true;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            let base64 = e.target.result;
            showLoading(true);
            try {
                let payload = { action: "submitPayment", username: SESSION_USER.username, email: SESSION_USER.email, bulan: totalBulan, harga: totalPaid, base64: base64 };
                let res = await fetchGAS(payload); showLoading(false);
                if(res.status === "success") {
                    SESSION_USER.hasPendingPayment = true;
                    closePaymentDrawer(); showAlert("Sukses", res.message, "fa-circle-check");
                    localStorage.setItem('goBorneo_partner_session', JSON.stringify({ user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: new Date(getServerAdjustedTime()).toISOString() }));
                    showSubscriptionModal(isSubscriptionExpired());
                } else { showAlert("Gagal", res.message, "fa-circle-xmark", true); }
            } catch(err) {
               showLoading(false);
               showAlert("Error Koneksi", err.message, "fa-wifi", true);
            } finally { btn.innerHTML = oriTxt; btn.disabled = false;
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
    
// =============================================
    // MODIFIKASI DRAW TOP UP & NOMINAL HANDLING
    // =============================================
    function openTopUpDrawer() {
        if (!SESSION_USER || !SESSION_COMPANY) return;
        // Tambahan style khusus untuk mode web (sidebar kanan) dan menghilangkan double scroll
        if (!document.getElementById('topUpStyleFix')) {
            let s = document.createElement('style');
            s.id = 'topUpStyleFix';
            s.innerHTML = `
                @media(min-width: 768px) {
                    #topUpDrawer { position: fixed !important; top: 0 !important; right: -500px !important; left: auto !important; width: 100% !important; max-width: 420px !important; height: 100vh !important; display: flex !important; flex-direction: column !important; transition: right 0.3s ease !important; box-shadow: -5px 0 20px rgba(0,0,0,0.15) !important; bottom: auto !important; z-index: 100000 !important;}
                    #topUpDrawer.open { right: 0 !important; }
                }
                #topUpDrawer .drawer-body { flex: 1; overflow-y: auto; overflow-x: hidden; }
                .input-rp-wrapper { position: relative; display: flex; align-items: center; width: 100%; }
                .input-rp-wrapper span { position: absolute; left: 15px; font-weight: 700; color: #64748b; font-size: 14px; }
            `;
            document.head.appendChild(s);
        }

        let topUpDrawer = document.getElementById('topUpDrawer');
        if (topUpDrawer) {
            topUpDrawer.style.display = 'flex';
            topUpDrawer.style.flexDirection = 'column';
            topUpDrawer.style.height = '100vh';
            
            let drawerBody = topUpDrawer.querySelector('.drawer-body');
            if (drawerBody) {
                drawerBody.style.flex = '1';
                drawerBody.style.overflowY = 'auto'; // handle scroll responsif
            }
            
            // Membungkus customTopUpNominal untuk prefix "Rp."
            let nominalInput = document.getElementById('customTopUpNominal');
            if (nominalInput) {
                nominalInput.type = 'text'; // Memastikan input menerima tipe text agar format ribuan tidak ditolak browser
                if (!nominalInput.parentElement || !nominalInput.parentElement.classList.contains('input-rp-wrapper')) {
                    let wrapper = document.createElement('div');
                    wrapper.className = 'input-rp-wrapper';
                    nominalInput.parentNode.insertBefore(wrapper, nominalInput);
                    
                    let rpSpan = document.createElement('span');
                    rpSpan.innerText = 'Rp.';
                    
                    wrapper.appendChild(rpSpan);
                    wrapper.appendChild(nominalInput);
                    
                    nominalInput.style.paddingLeft = '45px';
                }
            }
        }

        document.getElementById('topUpCurrentBalance').innerText = formatRupiah(SESSION_COMPANY.saldo || 0);
        selectedTopUpAmount = 0; document.getElementById('customTopUpNominal').value = "";
        document.querySelectorAll('.btn-nominal-opt').forEach(b => b.classList.remove('active'));
        document.getElementById('previewTopUpStruk').style.display = 'none'; document.getElementById('previewTopUpStruk').src = '';
        document.getElementById('topUpStrukFile').value = '';
        let htmlRek = "";
        if (globalRekeningList.length === 0) { htmlRek = "<p style='color:red; font-size:13px;'>Data Rekening Belum Tersedia.</p>";
        } else {
            globalRekeningList.forEach(rek => {
                htmlRek += `<div class="rek-card-modern" style="position:relative;">
                            <img src="${rek.logo || 'https://placehold.co/100x100?text=Bank'}" class="rek-logo" alt="Bank Logo">
                            <div class="rek-info" style="flex:1;"><h4>Bank ${rek.bank}</h4>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                                <div>
                                    <p class="norek" style="margin:0; font-size:15px; font-weight:700; color:#1E90FF;">${rek.norek}</p>
                                    <p class="name" style="margin:2px 0 0 0; font-size:12px; color:#64748b;">a/n ${rek.atasNama}</p>
                                </div>
                                <button class="btn-salin-keren" onclick="salinRekening('${rek.norek}')" title="Salin Rekening">
                                    <i class="fa-regular fa-copy"></i> Salin
                                </button>
                            </div>
                            </div></div>`;
            });
        }
        document.getElementById('topUpRekeningContainer').innerHTML = htmlRek;
        document.getElementById('topUpDrawer').classList.add('open'); pushBackButtonHandler('topUpDrawer');
    }

    function closeTopUpDrawer(fromPopState = false) {
        document.getElementById('topUpDrawer').classList.remove('open');
        if (!fromPopState) popBackButtonHandler();
    }

    function selectTopUpNominal(val) {
        selectedTopUpAmount = val;
        document.getElementById('customTopUpNominal').value = new Intl.NumberFormat('id-ID').format(val);
        document.querySelectorAll('.btn-nominal-opt').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.replace(/[^0-9]/g, '') == val) { btn.classList.add('active'); }
        });
    }

    function handleCustomNominalInput(input) {
        // Mencegah input bertipe number yang akan langsung kosong saat diisi titik pemisah ribuan
        if (input.type !== 'text') input.type = 'text';
        
        let rawVal = input.value.replace(/[^0-9]/g, '');
        let val = parseInt(rawVal, 10) || 0;
        selectedTopUpAmount = val;
        
        if (val > 0) {
            input.value = new Intl.NumberFormat('id-ID').format(val);
        } else {
            input.value = "";
        }
        
        document.querySelectorAll('.btn-nominal-opt').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.replace(/[^0-9]/g, '') == val) { btn.classList.add('active'); }
        });
    }
    // =============================================

    function previewTopUpStruk(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { document.getElementById('previewTopUpStruk').src = e.target.result; document.getElementById('previewTopUpStruk').style.display = 'block'; };
        reader.readAsDataURL(file);
    }

    async function submitRealTopUp() {
        if (!selectedTopUpAmount || selectedTopUpAmount <= 0) { return showAlert("Peringatan", "Masukkan nominal top up yang valid.", "fa-circle-exclamation", true);
        }
        let fileInput = document.getElementById('topUpStrukFile');
        if (!fileInput.files[0]) { return showAlert("Wajib", "Unggah foto bukti struk transfer.", "fa-image", true);
        }

        let btn = document.getElementById('btnSubmitRealTopUp'); let oriTxt = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Top Up...`; btn.disabled = true;

        const reader = new FileReader();
        reader.onload = async (e) => {
            let base64 = e.target.result;
            showLoading(true);
            try {
                let payload = { action: "submitTopUp", username: SESSION_USER.username, email: SESSION_USER.email, namaPerusahaan: SESSION_COMPANY.namaPerusahaan, nominal: selectedTopUpAmount, base64: base64 };
                let res = await fetchGAS(payload); showLoading(false);
                if (res.status === "success") { closeTopUpDrawer(); showAlert("Top Up Berhasil", res.message, "fa-circle-check");
                } else { showAlert("Gagal", res.message, "fa-circle-xmark", true); }
            } catch (err) { showLoading(false);
            showAlert("Error Koneksi", err.message, "fa-wifi", true); } 
            finally { btn.innerHTML = oriTxt;
            btn.disabled = false; }
        };
        reader.readAsDataURL(fileInput.files[0]);
    }

    async function loadRiwayatData() {
        if(!SESSION_USER || !SESSION_COMPANY) return;
        const container = document.getElementById('riwayatCardContainer');
        container.innerHTML = `<div style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px; font-weight:600;">Memuat riwayat...</p></div>`;
        try {
            if (isKomisiScheme()) {
                let result = await fetchGAS({action: "getTopUpHistory", username: SESSION_USER.username, namaPerusahaan: SESSION_COMPANY.namaPerusahaan});
                if (result.status === "success") { renderTopUpCards(result.data); } 
                else { container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-clock-rotate-left" style="font-size:40px; margin-bottom:12px;"></i><p>Belum ada riwayat top up.</p></div>`;
                }
            } else {
                let result = await fetchGAS({action: "getPaymentHistory", username: SESSION_USER.username});
                if (result.status === "success") { globalRiwayatList = result.data; renderRiwayatCards(globalRiwayatList); } 
                else { container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-clock-rotate-left" style="font-size:40px; margin-bottom:12px;"></i><p>Belum ada riwayat transaksi.</p></div>`;
                }
            }
        } catch(e) { container.innerHTML = `<div style="text-align: center; margin-top: 40px; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat riwayat.</div>`;
        }
    }

    function renderRiwayatCards(dataList) {
        const container = document.getElementById('riwayatCardContainer');
        if(dataList.length === 0) { container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-clock-rotate-left" style="font-size:40px; margin-bottom:12px;"></i><p>Belum ada riwayat transaksi.</p></div>`;
        return; }
        let htmlCards = '';
        dataList.forEach((item, idx) => {
            let badgeClass = item.status.toLowerCase() === 'selesai' ? 'selesai' : (item.status.toLowerCase() === 'ditolak' ? 'ditolak' : 'pending');
            let d = new Date(item.tanggal);
            let tglStr = isNaN(d.getTime()) ? item.tanggal : formatTglIndo(item.tanggal);
            let jamStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + " WIB" : "";
          
            htmlCards += `
            <div class="riwayat-card" style="animation-delay: ${idx * 0.05}s;" onclick="openRiwayatImageModal('${item.struk}')">
                <div style="flex:1;">
                    <p style="margin:0 0 5px 0; font-size:14px; font-weight:800; color:var(--text-main);">Pembelian paket layanan selama ${item.bulan} bulan</p>
                   
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${tglStr} ${jamStr ? '&bull; <i class="fa-regular fa-clock"></i> ' + jamStr : ''}</span>
                    </div>
                </div>
                <div style="margin-left: 15px; text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                    <div class="status-badge-modern ${badgeClass}" style="font-size:10px; padding:4px 8px; margin-bottom:6px;">${item.status.toUpperCase()}</div>
        
                    <span style="font-size:15px; font-weight:900; color:var(--primary);">${formatRupiah(item.harga)}</span>
                </div>
            </div>`;
        });
        container.innerHTML = htmlCards;
    }

    function renderTopUpCards(dataList) {
        const container = document.getElementById('riwayatCardContainer');
        if(dataList.length === 0) { container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-clock-rotate-left" style="font-size:40px; margin-bottom:12px;"></i><p>Belum ada riwayat top up.</p></div>`;
        return; }
        let htmlCards = '';
        dataList.forEach((item, idx) => {
            let badgeClass = item.status.toLowerCase() === 'selesai' ? 'selesai' : (item.status.toLowerCase() === 'ditolak' ? 'ditolak' : 'pending');
            let d = new Date(item.tanggal); 
            let tglStr = isNaN(d.getTime()) ? item.tanggal : formatTglIndo(item.tanggal);
            let jamStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + " WIB" : "";
         
            htmlCards += `
            <div class="riwayat-card" style="animation-delay: ${idx * 0.05}s;" onclick="openRiwayatImageModal('${item.struk}')">
                <div style="flex:1;">
                    <p style="margin:0 0 5px 0; font-size:14px; font-weight:800; color:var(--text-main);">Top Up Saldo</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${tglStr} ${jamStr ? '&bull; <i class="fa-regular fa-clock"></i> ' + jamStr : ''}</span>
                    </div>
                </div>
                <div style="margin-left: 15px; text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                    <div class="status-badge-modern ${badgeClass}" style="font-size:10px; padding:4px 8px; margin-bottom:6px;">${item.status.toUpperCase()}</div>
        
                    <span style="font-size:15px; font-weight:900; color:var(--primary);">${formatRupiah(item.nominal)}</span>
                </div>
            </div>`;
        });
        container.innerHTML = htmlCards;
    }

    function filterRiwayat() {
        let val = document.getElementById('riwayatSearchInput').value.toLowerCase();
        let cards = document.getElementById('riwayatCardContainer').querySelectorAll('.riwayat-card');
        cards.forEach(card => { let text = card.innerText.toLowerCase(); card.style.display = text.includes(val) ? '' : 'none'; });
    }

    function openRiwayatImageModal(imgUrl) {
        if(!imgUrl) { return showAlert("Info", "Struk gambar tidak tersedia.", "fa-circle-exclamation", true);
        }
        
        let directUrl = imgUrl;
        if (imgUrl.includes('drive.google.com')) {
            let idMatch = imgUrl.match(/id=([^&]+)/) || imgUrl.match(/file\/d\/([^\/]+)/);
            if (idMatch) { directUrl = "https://drive.google.com/thumbnail?id=" + idMatch[1] + "&sz=w1000";
            }
        }

        initRiwayatImageSidebar();
        let imgPreview = document.getElementById('riwayatSidebarImg');
        if (imgPreview) {
            imgPreview.src = directUrl;
        }

        let modal = document.getElementById('riwayatSidebarModal');
        if (modal) {
            modal.style.right = '0';
        }

        pushBackButtonHandler('riwayatImageModal');
    }
    
    function closeRiwayatImageModal(fromPopState = false) { 
        let modal = document.getElementById('riwayatSidebarModal');
        if(modal) {
            modal.style.right = '-500px';
        }

        let oldModal = document.getElementById('riwayatImageModal');
        if(oldModal) oldModal.classList.remove('open');

        if (!fromPopState) popBackButtonHandler();
    }

    function openMutasiSaldo() {
        document.getElementById('mutasiSaldoModal').style.right = '0';
        document.getElementById('mutasiSaldoModal').classList.add('open');
        pushBackButtonHandler('mutasiSaldoModal'); loadMutasiSaldo();
    }
    
    function closeMutasiSaldo(fromPopState = false) {
        document.getElementById('mutasiSaldoModal').style.right = '-500px';
        document.getElementById('mutasiSaldoModal').classList.remove('open');
        if (!fromPopState) popBackButtonHandler();
    }
    
    async function loadMutasiSaldo() {
        const container = document.getElementById('mutasiSaldoContainer');
        container.innerHTML = `<div style="text-align:center; padding: 30px 0; color:#94a3b8;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px; font-weight:600;">Memuat data mutasi...</p></div>`;
        try {
            let res = await fetchGAS({ action: "getMutasiSaldo", namaPerusahaan: SESSION_COMPANY.namaPerusahaan });
            if (res.status === "success" && res.data.length > 0) {
                let html = '';
                res.data.forEach((item, idx) => {
                    let d = new Date(item.tanggal);
                    let tglStr = isNaN(d.getTime()) ? item.tanggal : formatTglIndo(item.tanggal);
                    let jamStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + " WIB" : "";
             
                    html += `
                    <div class="riwayat-card" style="animation-delay: ${idx * 0.05}s; cursor: default; margin-bottom: 12px; border: 1px solid #fee2e2;">
                        <div style="flex:1;">
                    
                     <p style="margin:0 0 5px 0; font-size:13px; font-weight:700; color:var(--text-main);">
                                Pemotongan saldo untuk transaksi <span style="color:#0284c7;">${item.idBooking}</span>
                            </p>
                       
                   <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:11px; color:var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${tglStr} ${jamStr ? '&bull; <i class="fa-regular fa-clock"></i> ' + jamStr : ''}</span>
                            </div>
                        </div>
                        <div style="margin-left: 10px; text-align:right; display:flex; flex-direction:column; align-items:flex-end; justify-content: center;">
                            <span style="font-size:14px; font-weight:900; color:#ef4444;">- ${formatRupiah(item.nominal)}</span>
                        </div>
                    </div>`;
                });
                container.innerHTML = html;
            } else {
      
                container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 30px 0; color:#94a3b8;"><i class="fa-solid fa-receipt" style="font-size:36px; margin-bottom:12px;"></i><p>Belum ada riwayat mutasi.</p></div>`;
            }
        } catch (e) { container.innerHTML = `<div style="text-align: center; padding: 30px 0; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat mutasi.</div>`; }
    }

    function openAksesKursi() {
        if(activeLayananIndex === -1) return; closePengaturanModal();
        let _localD = new Date(); currentSeatDate = new Date(_localD.getTime() - (_localD.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        selectedManualSeats = []; document.getElementById('displaySeatDate').innerText = formatTglIndo(currentSeatDate);
        document.getElementById('pageAksesKursi').classList.add('open'); pushBackButtonHandler('aksesKursi');
        document.getElementById('seatGridContainer').style.display = 'none'; document.getElementById('seatLoading').style.display = 'block';
        fetchPesananDataSilently().then(() => { document.getElementById('seatLoading').style.display = 'none'; document.getElementById('seatGridContainer').style.display = 'grid'; renderSeatLayout(); });
        if(!seatPollingInterval) { seatPollingInterval = setInterval(() => { fetchPesananDataSilently(); }, 3000); }
    }
    function closeAksesKursi(fromPopState = false) { document.getElementById('pageAksesKursi').classList.remove('open');
        if(seatPollingInterval) { clearInterval(seatPollingInterval); seatPollingInterval = null; } 
        if (!fromPopState) popBackButtonHandler();
    }
    function renderSeatLayout() {
        const item = globalLayananList[activeLayananIndex];
        const kapasitas = parseInt(item.kapasitas) || 0; let bookedApp = []; let bookedManual = [];
        globalPesananList.forEach(order => { if(order.merkKendaraan === item.merk && isSameDate(order.tanggalBooking, currentSeatDate)) { let isManual = (order.role === "Mitra") || order.isManualLocal; let seatsArray = order.nomorKursi.toString().split(',').map(s => s.trim()); if(isManual) bookedManual.push(...seatsArray); else bookedApp.push(...seatsArray); } });
        let gridHtml = ''; const cols = ['A', 'B', 'C', 'D']; const numCols = cols.length;
        const numRows = Math.ceil(kapasitas / numCols); let totalRendered = 0;
        for(let row = 1; row <= numRows; row++) { for(let c = 0; c < numCols; c++) { if (totalRendered >= kapasitas) break;
        let seatNo = row + cols[c]; let isAppBooked = bookedApp.includes(seatNo); let isManualBooked = bookedManual.includes(seatNo); let isSelected = selectedManualSeats.includes(seatNo);
        let seatClass = 'available'; if(isAppBooked) seatClass = 'booked'; else if(isManualBooked) seatClass = 'manual'; else if(isSelected) seatClass = 'selected';
        let onclickFn = (isAppBooked || isManualBooked) ? '' : `onclick="toggleSeatSelection('${seatNo}')"`; let iconColorStyle = isSelected ? 'style="color: #fff"' : '';
        gridHtml += `<div class="seat-item ${seatClass}" ${onclickFn}><i class="fa-solid fa-chair" ${iconColorStyle}></i><span>${seatNo}</span></div>`; totalRendered++;
        } }
        let container = document.getElementById('seatGridContainer'); if(container) container.innerHTML = gridHtml;
    }
    function toggleSeatSelection(seatNo) { let index = selectedManualSeats.indexOf(seatNo); if(index > -1) selectedManualSeats.splice(index, 1); else selectedManualSeats.push(seatNo); renderSeatLayout();
    }

    function openSeatCalendar() { let parsed = new Date(currentSeatDate); if(!isNaN(parsed.getTime())) { currentSeatCalYear = parsed.getFullYear(); currentSeatCalMonth = parsed.getMonth();
        } renderSeatCalendar(); document.getElementById('seatCalendarModal').classList.add('open'); pushBackButtonHandler('seatCalendar'); }
    function closeSeatCalendar(fromPopState = false) { document.getElementById('seatCalendarModal').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    
    function renderSeatCalendar() { 
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        document.getElementById('seatCalMonthYearTitle').innerText = `${monthNames[currentSeatCalMonth]} ${currentSeatCalYear}`; let firstDay = new Date(currentSeatCalYear, currentSeatCalMonth, 1).getDay(); let daysInMonth = new Date(currentSeatCalYear, currentSeatCalMonth + 1, 0).getDate();
        let gridHtml = `<div style="font-size:11px; font-weight:700; color:#94a3b8;">Min</div><div style="font-size:11px; font-weight:700; color:#94a3b8;">Sen</div><div style="font-size:11px; font-weight:700; color:#94a3b8;">Sel</div><div style="font-size:11px; font-weight:700; color:#94a3b8;">Rab</div><div style="font-size:11px; font-weight:700; color:#94a3b8;">Kam</div><div style="font-size:11px; font-weight:700; color:#94a3b8;">Jum</div><div style="font-size:11px; font-weight:700; color:#94a3b8;">Sab</div>`;
        for (let i = 0; i < firstDay; i++) gridHtml += `<div></div>`;
        for (let day = 1; day <= daysInMonth; day++) { let mStr = (currentSeatCalMonth + 1).toString().padStart(2, '0');
        let dStr = day.toString().padStart(2, '0'); let fullDateStr = `${currentSeatCalYear}-${mStr}-${dStr}`; let isSelected = (fullDateStr === currentSeatDate); let style = isSelected ?
        "background: var(--primary); color: #fff; box-shadow: 0 4px 10px rgba(2,132,199,0.3);" : "background: #f1f5f9; color: var(--text-main);";
        gridHtml += `<div onclick="selectSeatDate('${fullDateStr}')" style="width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin:auto; cursor:pointer; font-size:13px; font-weight:700; transition:0.2s; ${style}">${day}</div>`; } document.getElementById('seatCalendarGrid').innerHTML = gridHtml;
    }
    function changeSeatCalendarMonth(dir) { currentSeatCalMonth += dir; if (currentSeatCalMonth > 11) { currentSeatCalMonth = 0; currentSeatCalYear++;
        } else if (currentSeatCalMonth < 0) { currentSeatCalMonth = 11; currentSeatCalYear--; } renderSeatCalendar();
    }
    function selectSeatDate(dateStr) { currentSeatDate = dateStr; selectedManualSeats = []; document.getElementById('displaySeatDate').innerText = formatTglIndo(dateStr); renderSeatLayout(); closeSeatCalendar();
    }
    
    function promptManualBookingPayment() { 
        if(isKomisiScheme()) {
            let activeBus = globalLayananList[activeLayananIndex];
            let totalHarga = activeBus.harga * selectedManualSeats.length;
            let kRate = SESSION_COMPANY.komisiRate || 0;
            let requiredKomisi = (kRate / 100) * totalHarga;
            if (SESSION_COMPANY.saldo < requiredKomisi) {
                return showAlert("Peringatan", "Maaf, saldo anda tidak mencukupi untuk membayar komisi aplikasi. Anda tidak dapat melakukan pemesanan manual. Silahkan top up saldo terlebih dahulu.", "fa-triangle-exclamation", true);
            }
        }
        if(selectedManualSeats.length === 0) { return showAlert("Perhatian", "Pilih minimal 1 kursi.", "fa-triangle-exclamation", true);
        } 
        document.getElementById('manualInputNamaPenumpang').value = ""; document.getElementById('manualInputNoHp').value = ""; document.getElementById('manualBookingPaymentModal').classList.add('show'); pushBackButtonHandler('manualBookingPaymentModal');
    }
    function closeManualPaymentModal(fromPopState = false) { document.getElementById('manualBookingPaymentModal').classList.remove('show');
        if(!fromPopState) popBackButtonHandler();
    }
    
    async function executeManualBooking() { 
        const activeBus = globalLayananList[activeLayananIndex];
        let now = new Date(); let timeString = now.toTimeString().split(' ')[0].substring(0, 5); let fullDateTimeBooking = currentSeatDate + " " + timeString;
        let paymentStatus = document.querySelector('input[name="manualPaymentStatus"]:checked').value; let inputNama = document.getElementById('manualInputNamaPenumpang').value.trim(); let inputHp = document.getElementById('manualInputNoHp').value.trim(); let finalNamaPenumpang = inputNama ? inputNama : SESSION_COMPANY.namaPerusahaan;
        let finalNoHp = inputHp ? inputHp : SESSION_COMPANY.noHpPerusahaan; 
        
        showLoading(true); 
        try { 
            let payload = { action: "manualBooking", userId: "MANUAL", role: "Mitra", username: SESSION_USER.username, namaPerusahaan: SESSION_COMPANY.namaPerusahaan, emailPenumpang: SESSION_USER.email, jenisKendaraan: activeBus.jenis, merkKendaraan: activeBus.merk, tanggalBooking: fullDateTimeBooking, nomorKursi: selectedManualSeats.join(", "), namaPenumpang: finalNamaPenumpang, noHp: finalNoHp, harga: activeBus.harga * selectedManualSeats.length, asal: activeBus.asal, tujuan: activeBus.tujuan, statusBooking: paymentStatus };
            let res = await fetchGAS(payload); 
            if(res.status === "success" || res.status === 200 || !res.error) { 
                await fetchPesananDataSilently();
                let generatedId = res.idBooking; let newOrder; 
                if(generatedId) { newOrder = globalPesananList.find(o => o.idBooking === generatedId);
                } 
                if(!newOrder) { let seatsStr = selectedManualSeats.join(", ");
                newOrder = globalPesananList.find(o => o.merkKendaraan === payload.merkKendaraan && o.nomorKursi === seatsStr && o.namaPenumpang === payload.namaPenumpang);
                } 
                
                showLoading(false);
                let komisi = res.komisiDeducted || 0;

                if(newOrder) { 
                    selectedManualSeats = [];
                    renderSeatLayout(); closeManualPaymentModal(); 
                    showAlert("Sukses", "Pesanan berhasil diproses.", "fa-check"); 
                    
                    if(komisi > 0) {
                        SESSION_COMPANY.saldo -= komisi;
                        setTimeout(() => {
                            showAlert("Pemotongan Saldo", `Saldo terpotong otomatis Rp ${formatNumber(komisi)}.`, "fa-file-invoice-dollar", false);
                            updateHeaderSchemeUI();
                        }, 4500);
                    }

                    lastGeneratedTicket = newOrder;
                    showManualTicketResult(newOrder);
                } else { 
                    newOrder = { idBooking: generatedId ||
                    "MENUNGGU_SINKRONISASI", userId: "MANUAL", role: "Mitra", merkKendaraan: payload.merkKendaraan, tanggalBooking: payload.tanggalBooking, nomorKursi: payload.nomorKursi, namaPenumpang: payload.namaPenumpang, namaPerusahaan: payload.namaPerusahaan, noHp: payload.noHp, harga: payload.harga, asal: payload.asal, tujuan: payload.tujuan, statusBooking: payload.statusBooking, isManualLocal: true };
                    globalPesananList.push(newOrder); selectedManualSeats = []; renderSeatLayout(); closeManualPaymentModal(); 
                    showAlert("Sukses", "Pesanan diproses, memuat sinkronisasi.", "fa-check");
                    if(komisi > 0) {
                        SESSION_COMPANY.saldo -= komisi;
                        setTimeout(() => {
                            showAlert("Pemotongan Saldo", `Saldo terpotong otomatis Rp ${formatNumber(komisi)}.`, "fa-file-invoice-dollar", false);
                            updateHeaderSchemeUI();
                        }, 4500);
                    }
                    
                    lastGeneratedTicket = newOrder;
                    showManualTicketResult(newOrder);
                } 
            } else { 
                showLoading(false);
                showAlert("Peringatan", res.message, "fa-triangle-exclamation", true); 
            } 
        } catch(e) { 
            showLoading(false);
            showAlert("Error Koneksi", e.message, "fa-wifi", true); 
        } 
    }

    function openTicketDetail(idBooking) { 
        let targetedOrder = globalPesananList.find(o => o.idBooking === idBooking);
        if(targetedOrder) { 
            if (isKomisiScheme() && targetedOrder.statusBooking.toLowerCase() !== "lunas") {
                let kRate = SESSION_COMPANY.komisiRate ||
                0;
                let requiredKomisi = (kRate / 100) * targetedOrder.harga;
                if (SESSION_COMPANY.saldo < requiredKomisi) {
                    return showAlert("Peringatan", "Maaf, saldo anda tidak mencukupi untuk membayar komisi aplikasi. Anda tidak dapat melihat detail tiket. Silahkan top up saldo terlebih dahulu.", "fa-triangle-exclamation", true);
                }
            }
            lastGeneratedTicket = targetedOrder;
            showManualTicketResult(targetedOrder); 
        } 
    }
    
    function generateBoardingPassHTML(order) { let tgl = formatTglIndo(order.tanggalBooking);
        return `<div class="boarding-pass-container" id="printableTicketCard"><div class="bp-main"><div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0284c7; padding-bottom:10px; margin-bottom:15px;"><h2 style="margin:0; color:#0284c7; font-weight:800; font-size:20px;">E-TICKET</h2><span style="font-weight:700; font-size:14px; color:#475569;">${SESSION_COMPANY.namaPerusahaan}</span></div><div style="display:flex; justify-content:space-between; margin-bottom:15px;"><div><p style="margin:0; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Nama Penumpang</p><p style="margin:0; font-size:16px; font-weight:800; text-transform:capitalize;">${order.namaPenumpang}</p></div><div style="text-align:right;"><p style="margin:0; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">ID Booking</p><p style="margin:0; font-size:14px; font-weight:800;">${order.idBooking}</p></div></div><div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border: 1px solid #e2e8f0; padding:10px; border-radius:8px; margin-bottom:15px;"><div style="text-align:center;"><p style="margin:0; font-size:16px; font-weight:800; color:#0284c7;">${order.asal}</p></div><i class="fa-solid fa-arrow-right" style="color:#94a3b8;"></i><div style="text-align:center;"><p style="margin:0; font-size:16px; font-weight:800; color:#0284c7;">${order.tujuan}</p></div></div><div style="display:flex; justify-content:space-between;"><div><p style="margin:0; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Tanggal Berangkat</p><p style="margin:0; font-size:13px; font-weight:700;">${tgl}</p></div><div><p style="margin:0; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Armada</p><p style="margin:0; font-size:13px; font-weight:700;">${order.merkKendaraan}</p></div><div style="text-align:right;"><p style="margin:0; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Status / Harga</p><p style="margin:0; font-size:13px; font-weight:800; color:${order.statusBooking.toLowerCase()==='lunas'?'#16a34a':'#dc2626'};">${order.statusBooking.toUpperCase()} / Rp ${formatNumber(order.harga)}</p></div></div></div><div class="bp-stub"><p style="margin:0 0 5px 0; font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase;">Kursi</p><p style="margin:0 0 15px 0; font-size:24px; font-weight:900; color:#0f172a;">${order.nomorKursi}</p><div id="ticketQrCode"></div><p style="margin:8px 0 0 0; font-size:9px; color:#94a3b8; font-weight:600; text-align:center;">Scan untuk<br>verifikasi tiket</p></div></div>`; 
    }
    
    function showManualTicketResult(order) { document.getElementById('manualTicketContent').innerHTML = generateBoardingPassHTML(order); document.getElementById('manualTicketResultModal').classList.add('open'); pushBackButtonHandler('manualTicketResultModal'); setTimeout(() => { document.getElementById('ticketQrCode').innerHTML = ""; new QRCode(document.getElementById("ticketQrCode"), { text: order.idBooking, width: 80, height: 80, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.M }); if (!order.imgUrl) { setTimeout(() => { autoUploadTicket(order); }, 150); } }, 150); }
    
    async function autoUploadTicket(order) { const btnWa = document.getElementById('btnShareWa'); const originalText = '<i class="brands fa-whatsapp"></i> Bagikan (WA)'; btnWa.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyiapkan Link...'; btnWa.disabled = true; 
        try { const ticketElement = document.getElementById('printableTicketCard');
        const canvas = await html2canvas(ticketElement, { scale: 1.5, useCORS: true }); const base64Image = canvas.toDataURL("image/jpeg", 0.7);
        const payload = { action: "uploadTicket", base64: base64Image, filename: "Ticket_" + order.idBooking, tanggalBooking: order.tanggalBooking, idBooking: order.idBooking };
        let res = await fetchGAS(payload); if (res.status === "success" && res.imgUrl) { order.imgUrl = res.imgUrl;
        if (lastGeneratedTicket && lastGeneratedTicket.idBooking === order.idBooking) { lastGeneratedTicket.imgUrl = res.imgUrl; } let idx = globalPesananList.findIndex(o => o.idBooking === order.idBooking);
        if(idx > -1) globalPesananList[idx].imgUrl = res.imgUrl; } else { showAlert('Error', res.message || 'Gagal unggah.', 'fa-xmark', true);
        } } catch (e) { console.error("Gagal Render", e); } finally { btnWa.innerHTML = originalText; btnWa.disabled = false;
        } }
    
    function closeManualTicketModal(fromPopState = false) { document.getElementById('manualTicketResultModal').classList.remove('open'); if(!fromPopState) popBackButtonHandler();
    }
    function printManualTicket() { window.print(); }
    function shareWhatsAppManualTicket() { if(!lastGeneratedTicket) return;
        if(!lastGeneratedTicket.imgUrl) { showAlert('Mohon Tunggu', 'Link gambar diproses.', 'fa-clock', true); return; } bukaWhatsAppDenganLink(lastGeneratedTicket, lastGeneratedTicket.imgUrl);
    }
    function bukaWhatsAppDenganLink(order, imgUrl) { let tgl = formatTglIndo(order.tanggalBooking);
        let text = `*E-TICKET GO BORNEO*\n\nDetail:\n• *ID:* ${order.idBooking}\n• *Nama:* ${order.namaPenumpang}\n• *Armada:* ${order.merkKendaraan}\n• *Rute:* ${order.asal} - ${order.tujuan}\n• *Kursi:* ${order.nomorKursi}\n• *Tgl:* ${tgl}\n• *Total:* Rp ${formatNumber(order.harga)}\n• *Status:* ${order.statusBooking.toUpperCase()}\n\n*Unduh Tiket Anda:*\n${imgUrl}`;
        let waUrlScheme = `whatsapp://send?text=${encodeURIComponent(text)}`; let waUrlWeb = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`; window.location.href = waUrlScheme; setTimeout(() => { window.open(waUrlWeb, '_blank'); }, 800);
    }

    function showConfirmModal(title, msg, iconClass, isDanger, callback) { document.getElementById('confirmTitle').innerText = title; document.getElementById('confirmMessage').innerText = msg;
        let iconEl = document.getElementById('confirmIcon'); iconEl.className = `confirm-icon fa-solid ${iconClass}`; iconEl.style.color = isDanger ? "#ef4444" : "#f59e0b"; let btnYes = document.getElementById('confirmYesBtn');
        btnYes.innerText = isDanger ? "Hapus" : "Keluar Akun"; btnYes.className = isDanger ? "confirm-btn btn-danger-confirm" : "confirm-btn btn-logout-confirm"; customConfirmCallback = callback;
        document.getElementById('customConfirmModal').classList.add('show'); pushBackButtonHandler('confirmModal'); }
    function closeConfirmModal(fromPopState = false) { document.getElementById('customConfirmModal').classList.remove('show'); customConfirmCallback = null; if (!fromPopState) popBackButtonHandler();
    }
    function executeConfirmAction() { if(customConfirmCallback) customConfirmCallback(); closeConfirmModal();
    }
    function handleDeleteClick() { if(activeLayananIndex === -1) return; const item = globalLayananList[activeLayananIndex];
        showConfirmModal("Konfirmasi Hapus", `Apakah Anda yakin ingin menghapus armada ${item.merk}?`, "fa-trash", true, executeDeleteService);
    }
    function handleLogoutClick() { showConfirmModal("Keluar Akun", "Sesi Anda akan diakhiri. Apakah yakin keluar?", "fa-arrow-right-from-bracket", false, executeLogout);
    }

    function openPaymentModal(idBooking) { 
        let order = globalPesananList.find(o => o.idBooking === idBooking);
        if (isKomisiScheme() && order && order.statusBooking.toLowerCase() !== "lunas") {
            let kRate = SESSION_COMPANY.komisiRate ||
            0;
            let requiredKomisi = (kRate / 100) * order.harga;
            if (SESSION_COMPANY.saldo < requiredKomisi) {
                return showAlert("Peringatan", "Maaf, saldo anda tidak mencukupi untuk membayar komisi aplikasi. Anda tidak dapat melakukan konfirmasi pembayaran. Silahkan top up saldo terlebih dahulu.", "fa-triangle-exclamation", true);
            }
        }
        currentPaymentOrderId = idBooking;
        let modalEl = document.getElementById('paymentConfirmModal');

        if (modalEl) {
            if(!document.getElementById('paymentResponsiveStyles')) {
                let s = document.createElement('style');
                s.id = 'paymentResponsiveStyles';
                s.innerHTML = `
                    .pay-wrap { display: flex; flex-direction: row; text-align: left; gap: 20px; align-items: stretch; }
                    .pay-left { flex: 1; display: flex; flex-direction: column; justify-content: center; }
                    .pay-right { flex: 0 0 45%; display: flex; flex-direction: column; justify-content: center; align-items: center; border-left: 1px dashed #e2e8f0; padding-left: 20px; }
                    .pay-img { width: 100%; max-height: 250px; object-fit: contain; border-radius: 8px; cursor: pointer; border: 1px solid #e2e8f0; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                    .pay-img:hover { transform: scale(1.03); }
                    .btn-mobile-struk { display: none; margin-top: 15px; background: #f8fafc; color: #0284c7; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; font-weight: 700; cursor: pointer; text-align: center; width: 100%; transition: 0.2s; }
                    .btn-mobile-struk:hover { background: #f0f9ff; }
                    @media(max-width: 768px){
                        .pay-wrap { flex-direction: column; text-align: center; gap: 0; }
                        .pay-right { display: none !important; }
                        .btn-mobile-struk { display: block !important; }
                    }
                `;
                document.head.appendChild(s);
            }

            let contentContainer = modalEl.querySelector('.modal-content');
            if(!contentContainer) contentContainer = modalEl;

            if (!contentContainer.classList.contains('restructured')) {
                let wrap = document.createElement('div');
                wrap.className = 'pay-wrap';
                let left = document.createElement('div');
                left.className = 'pay-left';
                let right = document.createElement('div');
                right.className = 'pay-right';
                right.id = 'dynamicStrukBoxRight';
                Array.from(contentContainer.childNodes).forEach(child => {
                    if (child.nodeType === 1 && child.classList.contains('close-btn')) {
                    } else {
                        left.appendChild(child);
                    }
      
                });
                wrap.appendChild(left);
                wrap.appendChild(right);
                contentContainer.appendChild(wrap);
                contentContainer.classList.add('restructured');

                let mobileBtn = document.createElement('button');
                mobileBtn.id = 'btnMobileStruk';
                mobileBtn.className = 'btn-mobile-struk';
                mobileBtn.innerHTML = '<i class="fa-solid fa-image"></i> Lihat Foto Struk';
                left.appendChild(mobileBtn);
            }

            let rightPanel = document.getElementById('dynamicStrukBoxRight');
            let mobileBtn = document.getElementById('btnMobileStruk');
            let isManual = (order && (order.role === "Mitra" || order.isManualLocal));
            // Re-konfigurasi Tombol Aksi di Modal Konfirmasi (Belum/Kembali, Tolak, Sudah Bayar)
            let btnSudah = document.getElementById('btnSudahBayar');
            if(btnSudah) {
                let parentAction = btnSudah.parentElement;
                let oldTolak = document.getElementById('btnTolakBayar');
                if(oldTolak) oldTolak.remove();
                
                let btnBelum = Array.from(parentAction.querySelectorAll('button')).find(b => b.id !== 'btnSudahBayar' && b.id !== 'btnMobileStruk' && !b.classList.contains('close-btn'));
                if (isManual) {
                    if(btnBelum) btnBelum.innerText = "Belum";
                } else {
                    if(btnBelum) btnBelum.innerText = "Kembali";
                    let btnTolak = document.createElement('button');
                    btnTolak.id = 'btnTolakBayar';
                    btnTolak.innerText = "Tolak";
                    btnTolak.style.cssText = "padding:12px 20px; border-radius:8px; border:none; background:#ef4444; color:white; font-weight:700; cursor:pointer; flex: 1;";
                    btnTolak.onclick = function() { handleTolakPayment(); };
                    
                    parentAction.insertBefore(btnTolak, btnSudah);
                    parentAction.style.display = 'flex';
                    parentAction.style.gap = '10px';
                    if(btnBelum) btnBelum.style.flex = '1';
                    if(btnSudah) btnSudah.style.flex = '1';
                }
            }

            if (isManual) {
                rightPanel.style.display = 'none';
                mobileBtn.style.display = 'none';
                rightPanel.innerHTML = ''; 
            } else {
                rightPanel.style.display = '';
                mobileBtn.style.display = '';
                let imgUrl = order.strukPayment;
                if (imgUrl) {
                    if (imgUrl.includes('drive.google.com')) {
                        let idMatch = imgUrl.match(/id=([^&]+)/) || imgUrl.match(/file\/d\/([^\/]+)/);
                        if (idMatch) { imgUrl = "https://drive.google.com/thumbnail?id=" + idMatch[1] + "&sz=w1000";
                        }
                    }
                    rightPanel.innerHTML = `<p style="font-size:13px; font-weight:800; color:#0f172a; margin-bottom:12px;">Bukti Pembayaran</p>
                    <img src="${imgUrl}" alt="Struk" class="pay-img" onclick="openRiwayatImageModal('${order.strukPayment}')" />
                    <span style="font-size:10px; color:#94a3b8; margin-top:8px;">Klik gambar untuk perbesar</span>`;
                    mobileBtn.onclick = function() { openRiwayatImageModal(order.strukPayment); };
                    mobileBtn.disabled = false;
                    mobileBtn.style.opacity = '1';
                    mobileBtn.innerHTML = '<i class="fa-solid fa-image"></i> Lihat Foto Struk';
                } else {
                    rightPanel.innerHTML = `<div style="padding:20px; background:#f8fafc; border-radius:12px; font-size:12px; color:#94a3b8; border:1px dashed #cbd5e1; text-align:center; width:100%;">
                    <i class="fa-solid fa-image-slash" style="font-size:24px; margin-bottom:8px;"></i><br>User belum mengunggah struk pembayaran.</div>`;
                    mobileBtn.onclick = null;
                    mobileBtn.disabled = true;
                    mobileBtn.style.opacity = '0.5';
                    mobileBtn.innerHTML = '<i class="fa-solid fa-image-slash"></i> Belum Ada Bukti Transfer';
                }
            }
        }

        document.getElementById('paymentConfirmModal').classList.add('show');
        pushBackButtonHandler('paymentModal');
    }
    
    function closePaymentModal(fromPopState = false) { document.getElementById('paymentConfirmModal').classList.remove('show'); currentPaymentOrderId = "";
        if (!fromPopState) popBackButtonHandler();
    }
    
    function handleSudahBayarClick() { let btn = document.getElementById('btnSudahBayar');
        let originalText = btn.innerText;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses...`; btn.disabled = true; btn.style.opacity = '0.7';
        setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; btn.style.opacity = '1'; executePaymentConfirm(); }, 3000);
    }
    
    function handleTolakPayment() {
        let btn = document.getElementById('btnTolakBayar');
        let originalText = btn.innerText;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses...`; 
        btn.disabled = true; btn.style.opacity = '0.7';
        setTimeout(() => { 
            btn.innerHTML = originalText; btn.disabled = false; btn.style.opacity = '1'; 
            executeTolakPayment(); 
        }, 1500);
    }
    
    async function executePaymentConfirm() { 
        if(!currentPaymentOrderId || !SESSION_COMPANY) return;
        let idToConfirm = currentPaymentOrderId; 
        closePaymentModal();
        
        let suffixes = ["", "-popup"];
        suffixes.forEach(suffix => { 
            let btnConfirm = document.getElementById(`btn-confirm-${idToConfirm}${suffix}`); 
            let badgeEl = document.getElementById(`badge-${idToConfirm}${suffix}`); 
            if(btnConfirm) btnConfirm.style.display = 'none'; 
            if(badgeEl) { badgeEl.className = 'status-ribbon-bottom-left aktif'; badgeEl.innerText = 'LUNAS'; } 
        });
        let orderIdx = globalPesananList.findIndex(o => o.idBooking === idToConfirm); 
        if(orderIdx > -1) { 
            globalPesananList[orderIdx].statusBooking = 'Lunas';
            updateDashboardPesananStats();
            if(orderChartInstance) { 
                let activeType = document.querySelector('.chart-filter-btn.active').id.replace('btn-chart-','');
                updateChartFilter(activeType); 
            } 
        } 
        
        try { 
            let res = await fetchGAS({ action: "confirmPayment", idBooking: idToConfirm, namaPerusahaan: SESSION_COMPANY.namaPerusahaan, statusBooking: "Lunas" });
            if(res.status !== "success") { throw new Error(res.message); } 
            showAlert("Berhasil", "Pesanan tiket dibayarkan.", "fa-check");
            if (res.komisiDeducted > 0) {
                SESSION_COMPANY.saldo -= res.komisiDeducted;
                setTimeout(() => {
                    showAlert("Pemotongan Saldo", `Saldo terpotong otomatis Rp ${formatNumber(res.komisiDeducted)} untuk komisi.`, "fa-file-invoice-dollar", false);
                    updateHeaderSchemeUI();
                }, 4000);
            }
        } catch(e) { 
            suffixes.forEach(suffix => { 
                let btnConfirm = document.getElementById(`btn-confirm-${idToConfirm}${suffix}`); 
                let badgeEl = document.getElementById(`badge-${idToConfirm}${suffix}`); 
                if(btnConfirm) btnConfirm.style.display = 'inline-block'; 
              
                if(badgeEl) { badgeEl.className = 'status-ribbon-bottom-left non-aktif'; 
                badgeEl.innerText = 'BELUM BAYAR'; } 
            });
            if(orderIdx > -1) { 
                globalPesananList[orderIdx].statusBooking = 'Belum Bayar';
                updateDashboardPesananStats(); 
                if(orderChartInstance) { 
                    let activeType = document.querySelector('.chart-filter-btn.active').id.replace('btn-chart-','');
                    updateChartFilter(activeType);
                } 
            } 
            showAlert("Peringatan", e.message || "Gagal sinkronisasi.", "fa-triangle-exclamation", true);
        } 
    }

    async function executeTolakPayment() {
        if(!currentPaymentOrderId || !SESSION_COMPANY) return;
        let idToConfirm = currentPaymentOrderId; 
        closePaymentModal();
        
        let suffixes = ["", "-popup"];
        suffixes.forEach(suffix => { 
            let btnConfirm = document.getElementById(`btn-confirm-${idToConfirm}${suffix}`); 
            let badgeEl = document.getElementById(`badge-${idToConfirm}${suffix}`); 
            if(btnConfirm) btnConfirm.style.display = 'none'; 
            if(badgeEl) { badgeEl.className = 'status-ribbon-bottom-left ditolak'; badgeEl.innerText = 'DITOLAK'; } 
        });
        let orderIdx = globalPesananList.findIndex(o => o.idBooking === idToConfirm); 
        if(orderIdx > -1) { 
            globalPesananList[orderIdx].statusBooking = 'Tolak';
            updateDashboardPesananStats();
            if(orderChartInstance) { 
                let activeType = document.querySelector('.chart-filter-btn.active').id.replace('btn-chart-','');
                updateChartFilter(activeType); 
            } 
        } 
        
        try { 
            let res = await fetchGAS({ action: "confirmPayment", idBooking: idToConfirm, namaPerusahaan: SESSION_COMPANY.namaPerusahaan, statusBooking: "Tolak" });
            if(res.status !== "success") { throw new Error(res.message); } 
            showAlert("Ditolak", "Pesanan telah ditolak.", "fa-ban");
        } catch(e) { 
            showAlert("Peringatan", e.message || "Gagal sinkronisasi.", "fa-triangle-exclamation", true);
        }
    }

    function formatTglIndo(tglStr) { if (!tglStr) return "-";
        try { const date = new Date(tglStr); if (isNaN(date.getTime())) return tglStr;
        const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }; return date.toLocaleDateString('id-ID', options);
        } catch(e) { return tglStr; } }
    function formatNumber(angka) { if(!angka) return "0"; return new Intl.NumberFormat('id-ID').format(angka);
    }
    function formatRupiah(angka) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka).replace("Rp", "Rp.");
    }
    function hitungDurasi(jB, jS) { let [h1, m1] = jB.split(':').map(Number); let [h2, m2] = jS.split(':').map(Number);
        let dH = h2 - h1; let dM = m2 - m1; if (dM < 0) { dM += 60;
        dH -= 1; } if (dH < 0) dH += 24; let res = []; if (dH > 0) res.push(`${dH}j`);
        if (dM > 0) res.push(`${dM}m`); return res.join(' ') || "0m";
    }

    function calculateRealChartData(type) { let labels = []; let data = [];
        let lunasOrders = globalPesananList.filter(o => o.statusBooking.toLowerCase() === 'lunas'); if (type === 'hari') { labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        data = [0, 0, 0, 0, 0, 0, 0]; lunasOrders.forEach(o => { let d = new Date(o.tanggalBooking); if(!isNaN(d.getTime())) { data[d.getDay()]++; } });
        let labelMin = labels.shift(); labels.push(labelMin); let valMin = data.shift(); data.push(valMin);
        } else if (type === 'bulan') { labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        data = Array(12).fill(0); let currentYear = new Date().getFullYear(); lunasOrders.forEach(o => { let d = new Date(o.tanggalBooking); if(!isNaN(d.getTime()) && d.getFullYear() === currentYear) { data[d.getMonth()]++; } });
        } else if (type === 'tahun') { let yearCounts = {};
        lunasOrders.forEach(o => { let d = new Date(o.tanggalBooking); if(!isNaN(d.getTime())) { let y = d.getFullYear(); yearCounts[y] = (yearCounts[y] || 0) + 1; } });
        labels = Object.keys(yearCounts).sort(); if(labels.length === 0) { labels = [new Date().getFullYear().toString()]; yearCounts[labels[0]] = 0; } data = labels.map(y => yearCounts[y]);
        } return { labels, data }; }
        
    function initStatisticsChart() { if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById('orderAnalyticsChart'); if(!ctx) return; let gradientFill = ctx.getContext('2d').createLinearGradient(0, 0, 0, 180); gradientFill.addColorStop(0, 'rgba(2, 132, 199, 0.35)');
        gradientFill.addColorStop(1, 'rgba(2, 132, 199, 0.01)'); orderChartInstance = new Chart(ctx, { type: 'line', data: { labels: [], datasets: [{ label: 'Pesanan Lunas', data: [], borderColor: '#0284c7', borderWidth: 2.5, backgroundColor: gradientFill, fill: true, tension: 0.35, pointBackgroundColor: '#0284c7', pointHoverRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0, 0, 0, 0.04)' }, ticks: { font: { size: 10, family: 'Inter' }, color: '#64748b', precision: 0 } }, x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Inter' }, color: '#64748b' } } 
    } } }); updateChartFilter('hari');
    }
    function updateChartFilter(type) { document.querySelectorAll('.chart-filter-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-chart-${type}`).classList.add('active');
        if(!orderChartInstance) return;
        let chartData = calculateRealChartData(type); orderChartInstance.data.labels = chartData.labels;
        orderChartInstance.data.datasets[0].data = chartData.data; orderChartInstance.update();
    }

    function populateDashboardData() { if(!SESSION_USER || !SESSION_COMPANY) return; document.getElementById('layananCompName').innerText = SESSION_COMPANY.namaPerusahaan;
    let logoSrc = SESSION_COMPANY.logo ?
        SESSION_COMPANY.logo : "https://placehold.co/100x100?text=No+Logo"; document.getElementById('layananLogo').src = logoSrc; document.getElementById('profileLogoImg').src = logoSrc; document.getElementById('profileCompTitle').innerText = SESSION_COMPANY.namaPerusahaan; document.getElementById('profileUserTitle').innerText = `@${SESSION_USER.username}`;
    document.getElementById('pCompDesc').innerText = SESSION_COMPANY.deskripsiPerusahaan;
        document.getElementById('stat-total-armada').innerText = globalLayananList ? globalLayananList.length : 0; updateHeaderSchemeUI();
        
        let existingBtn = document.getElementById('btnMutasiSaldo');
        if (isKomisiScheme()) {
            if (!existingBtn) {
                let btnHtml = `
                <div id="btnMutasiSaldo" class="menu-item mutasi-menu-item" onclick="openMutasiSaldo()" style="margin-top: 0px; margin-bottom: 15px; display: flex; align-items: center; padding: 15px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; border: 1px solid #e2e8f0;">
                <div class="mutasi-icon-box" style="width: 40px; height: 40px; border-radius: 10px; background: #f0fdf4; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-right: 15px;">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <div style="flex: 1;">
               
                       <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text-main);">Mutasi Saldo</h4>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-muted);">Riwayat pemotongan komisi</p>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color: #cbd5e1;"></i>
     
                 </div>
                <style>
                    .mutasi-menu-item { transition: all 0.3s ease; }
                    .mutasi-menu-item .mutasi-icon-box { transition: all 0.3s ease; }
                    .mutasi-menu-item:hover { border-color: #10b981 !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15) !important; transform: translateY(-2px); }
                    .mutasi-menu-item:hover .mutasi-icon-box { background: #10b981 !important; color: #fff !important; }
                </style>`;
                let editPerusahaanBtn = document.querySelector('[onclick="openEditPerusahaan()"]');
                if (editPerusahaanBtn) {
                    editPerusahaanBtn.insertAdjacentHTML('afterend', btnHtml);
                } else if (document.getElementById('pCompDesc')) {
                    document.getElementById('pCompDesc').insertAdjacentHTML('afterend', btnHtml);
                }
            } else {
                existingBtn.style.display = 'flex';
            }
        } else {
            if (existingBtn) existingBtn.style.display = 'none';
        }
    }
    
    function updateDashboardPesananStats() { let belumBayar = 0;
        let lunas = 0; globalPesananList.forEach(o => { if (o.statusBooking.toLowerCase() === 'lunas') lunas++; else belumBayar++; }); if(document.getElementById('stat-pesanan-aktif')) document.getElementById('stat-pesanan-aktif').innerText = belumBayar;
        if(document.getElementById('stat-pesanan-selesai')) document.getElementById('stat-pesanan-selesai').innerText = lunas; }

    function toggleDesktopSidebar(fromPopState = false) { let sidebar = document.getElementById('desktopSidebar');
        let overlay = document.getElementById('desktopSidebarOverlay'); let wasOpen = sidebar && sidebar.classList.contains('open'); if(sidebar) sidebar.classList.toggle('open'); if(overlay) overlay.classList.toggle('open'); let isOpenNow = sidebar && sidebar.classList.contains('open');
        if (isOpenNow) { pushBackButtonHandler('desktopSidebar'); } else if (wasOpen && !fromPopState) { popBackButtonHandler();
        } }
    function toggleClearBtn(input) { let btn = input.nextElementSibling;
        if(btn && btn.classList.contains('clear-btn')) { btn.style.display = input.value.length > 0 ? 'block' : 'none';
        } }
    function clearSearch(inputId) { let input = document.getElementById(inputId); if(input) { input.value = ''; toggleClearBtn(input);
        if(inputId === 'regionSearchInput') filterRegions(); if(inputId === 'layananSearchInputWeb') filterLayananWeb(); if(inputId === 'pesananSearchInput') filterPesananMobile(); if(inputId === 'layananSearchInput') filterLayananMobile(); if(inputId === 'riwayatSearchInput') filterRiwayat();
        } }
    function openLayananSearch() { document.getElementById('layananSearchOverlay').classList.add('show'); document.getElementById('layananSearchInput').focus(); pushBackButtonHandler('layananSearch');
    }
    function closeLayananSearch(fromPopState = false) { document.getElementById('layananSearchOverlay').classList.remove('show'); clearSearch('layananSearchInput'); if (!fromPopState) popBackButtonHandler();
    }
    function filterLayananMobile() { let val = document.getElementById('layananSearchInput').value.toLowerCase(); doSearchLayananDOM(val);
    }
    function toggleWebSearch(forceClose = false) { let box = document.getElementById('webSearchExpand'); if(forceClose) { box.classList.remove('expanded'); clearSearch('layananSearchInputWeb'); return; } box.classList.toggle('expanded');
        if(box.classList.contains('expanded')) { document.getElementById('layananSearchInputWeb').focus(); } else { clearSearch('layananSearchInputWeb'); } }
    function filterLayananWeb() { let val = document.getElementById('layananSearchInputWeb').value.toLowerCase(); doSearchLayananDOM(val);
    }
    function doSearchLayananDOM(val) { let cards = document.getElementById('layananCardContainer').querySelectorAll('.ticket-card');
        cards.forEach(card => { let text = card.innerText.toLowerCase(); card.style.display = text.includes(val) ? '' : 'none'; });
    }
    function filterPesananMobile() { let val = document.getElementById('pesananSearchInput').value.toLowerCase(); let cards = document.querySelectorAll('.pesanan-card-item');
        cards.forEach(card => { let text = card.innerText.toLowerCase(); card.style.display = text.includes(val) ? '' : 'none'; });
    }
    function toggleOrderFilter() { document.getElementById('orderFilterMenu').classList.toggle('open'); }
    document.addEventListener('click', function(e) { let filterDropdown = document.getElementById('orderFilterMenu'); if(filterDropdown && filterDropdown.classList.contains('open')) { if(!e.target.closest('.filter-dropdown')) { filterDropdown.classList.remove('open'); } } });
    function setPesananFilter(type) { currentPesananFilter = type; document.getElementById('orderFilterMenu').classList.remove('open'); renderPesananCards(globalPesananList); }

    function openScanner() { 
        if(isKomisiScheme() && SESSION_COMPANY.saldo <= 0) { 
            return showAlert("Peringatan", "Maaf, saldo anda tidak mencukupi untuk membayar komisi aplikasi. Anda tidak dapat menggunakan fitur scan tiket. Silahkan top up saldo terlebih dahulu.", "fa-triangle-exclamation", true);
        }
        document.getElementById('scannerModal').classList.add('open'); html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, onScanSuccess, onScanFailure).catch(err => { console.error(err); showAlert("Akses Kamera", "Gagal membuka.", "fa-camera", true); });
        pushBackButtonHandler('scanner'); }
    function closeScanner(fromPopState = false) { document.getElementById('scannerModal').classList.remove('open');
        if(html5QrCode) { html5QrCode.stop().then(() => { html5QrCode.clear(); html5QrCode = null; }).catch(err => console.log(err)); } if (!fromPopState) popBackButtonHandler();
    }
    function openScannedTicketDrawer() { document.getElementById('scannedTicketDrawer').classList.add('open'); pushBackButtonHandler('scannedTicket'); }
    function closeScannedTicketDrawer(fromPopState = false) { document.getElementById('scannedTicketDrawer').classList.remove('open');
        if (!fromPopState) popBackButtonHandler(); }
    function onScanSuccess(decodedText, decodedResult) { closeScanner();
        let targetedOrder = globalPesananList.find(o => o.idBooking === decodedText || o.idBooking.includes(decodedText));
        if (targetedOrder) { document.getElementById('scannedTicketContent').innerHTML = `<div style="padding: 10px 20px 20px 20px;">${generateTicketCardHTML(targetedOrder, true, 0)}</div>`; openScannedTicketDrawer(); showAlert('Berhasil', 'Scan Tiket ditemukan.', 'fa-qrcode');
        } else { showAlert('Tidak Ditemukan', 'Tiket tidak ada.', 'fa-circle-xmark', true);
        } }
    function onScanFailure(error) { }

    function togglePassword(icon, inputId) { let input = document.getElementById(inputId);
        if (input.type === "password") { input.type = "text"; icon.classList.remove("fa-eye-slash"); icon.classList.add("fa-eye"); } else { input.type = "password"; icon.classList.remove("fa-eye"); icon.classList.add("fa-eye-slash");
        } }
    function showLoading(show) { document.getElementById('globalLoader').style.display = show ? "flex" : "none";
    }
    
    function showAlert(title, message, iconClass = "fa-check", isError = false) { 
        let toast = document.getElementById('alertToast');
        let iconDiv = document.getElementById('alertIcon'); 
        document.getElementById('alertTitle').innerText = title; document.getElementById('alertMessage').innerText = message; 
        iconDiv.className = isError ? "alert-icon error" : "alert-icon success";
        iconDiv.innerHTML = `<i class="fa-solid ${iconClass}"></i>`; 
        toast.classList.remove('show'); void toast.offsetWidth; toast.classList.add('show');
        setTimeout(closeAlert, 4000);
    }
    function closeAlert() { let toast = document.getElementById('alertToast'); toast.classList.remove('show');
    }

    function handleImageSelection(event, targetPreviewId, aspectRatio) { const file = event.target.files[0]; if(!file) return; currentTargetImageId = targetPreviewId;
        const reader = new FileReader(); reader.onload = (e) => { document.getElementById('cropperImage').src = e.target.result; document.getElementById('cropperModal').classList.add('open'); if(cropperInstance) cropperInstance.destroy();
        cropperInstance = new Cropper(document.getElementById('cropperImage'), { aspectRatio: aspectRatio, viewMode: 2, autoCropArea: 1, responsive: true }); pushBackButtonHandler('cropperModal'); }; reader.readAsDataURL(file);
    }
    function cancelCrop(fromPopState = false) { document.getElementById('cropperModal').classList.remove('open'); if(cropperInstance) cropperInstance.destroy(); document.getElementById('compLogoFile').value = ""; document.getElementById('addFotoFile').value = "";
        document.getElementById('editFotoFile').value = ""; document.getElementById('editCompLogoInput').value = ""; if (!fromPopState) popBackButtonHandler(); }
    function applyCrop() { if(!cropperInstance) return;
        const canvas = cropperInstance.getCroppedCanvas({ width: 400, fillColor: '#fff' }); const base64Image = canvas.toDataURL('image/jpeg', 0.6); document.getElementById(currentTargetImageId).src = base64Image; document.getElementById(currentTargetImageId).style.display = 'block';
        if(currentTargetImageId === 'previewCompLogo') base64CompLogo = base64Image; else if (currentTargetImageId === 'previewEditCompLogo') base64EditCompLogo = base64Image;
        else if(currentTargetImageId === 'previewAddFoto' || currentTargetImageId === 'previewEditFoto') base64ArmadaFoto = base64Image; cancelCrop();
    }

    async function initCityData() { try { const response = await fetch('https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/regencies.json');
        if (response.ok) { const rawData = await response.json(); indonesianRegionsDatabase = rawData.map(item => { let name = item.name.toLowerCase().replace('kabupaten ', 'Kab. ').replace('kota ', ''); return name.replace(/\b\w/g, c => c.toUpperCase()); });
        } } catch (e) { } }
    function openRegionSelection(targetInputId) { activeRegionInputTargetId = targetInputId;
        document.getElementById('regionModalTitle').innerText = targetInputId === "addAsal" || targetInputId === "editAsal" ? "Pilih Kota Asal" : "Pilih Kota Tujuan"; clearSearch('regionSearchInput'); renderRegionList(indonesianRegionsDatabase); document.getElementById('regionModal').classList.add('open');
        pushBackButtonHandler('regionModal'); }
    function closeRegionModal(fromPopState = false) { document.getElementById('regionModal').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    function renderRegionList(items) { let listHtml = items.length === 0 ?
        `<li style="text-align:center; padding:20px; color:var(--text-muted);">Wilayah tidak ditemukan</li>` : ""; items.slice(0, 150).forEach(cityName => { listHtml += `<li class="modal-list-item" onclick="selectRegionValue('${cityName}')"><i class="fa-solid fa-location-dot"></i> <span>${cityName}</span></li>`; });
        document.getElementById('regionListContainer').innerHTML = listHtml; }
    function filterRegions() { renderRegionList(indonesianRegionsDatabase.filter(name => name.toLowerCase().includes(document.getElementById('regionSearchInput').value.toLowerCase().trim())));
    }
    function selectRegionValue(val) { document.getElementById(activeRegionInputTargetId).value = val; closeRegionModal();
    }
    
    function initTimePickerOptions() { let hourHtml = "", minHtml = "";
        for(let i=0; i<24; i++) { let pad = i.toString().padStart(2, '0'); hourHtml += `<div class="time-opt-item" data-val="${pad}" onclick="selectTimeItem('hour', this)">${pad}</div>`;
        } for(let i=0; i<60; i+=5) { let pad = i.toString().padStart(2, '0'); minHtml += `<div class="time-opt-item" data-val="${pad}" onclick="selectTimeItem('minute', this)">${pad}</div>`;
        } document.getElementById('hourScrollBox').innerHTML = hourHtml; document.getElementById('minuteScrollBox').innerHTML = minHtml; }
    function openTimeSelection(targetInputId) { activeTimeInputTargetId = targetInputId;
        document.getElementById('timeModalTitle').innerText = targetInputId === "addJamB" || targetInputId === "editJamB" ? "Jam Keberangkatan" : "Estimasi Jam Tiba"; let hBox = document.getElementById('hourScrollBox');
        let mBox = document.getElementById('minuteScrollBox'); if(!hBox.querySelector('.selected')) hBox.children[0].classList.add('selected'); if(!mBox.querySelector('.selected')) mBox.children[0].classList.add('selected'); document.getElementById('timePickerModal').classList.add('open'); pushBackButtonHandler('timePicker'); }
    function closeTimeModal(fromPopState = false) { document.getElementById('timePickerModal').classList.remove('open');
        if (!fromPopState) popBackButtonHandler(); }
    function selectTimeItem(type, element) { let parent = type === 'hour' ?
        document.getElementById('hourScrollBox') : document.getElementById('minuteScrollBox'); parent.querySelectorAll('.time-opt-item').forEach(item => item.classList.remove('selected')); element.classList.add('selected'); element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function handleTimeScroll(type) { clearTimeout(window[`scrollTimeTimeout_${type}`]); window[`scrollTimeTimeout_${type}`] = setTimeout(() => { let parent = type === 'hour' ? document.getElementById('hourScrollBox') : document.getElementById('minuteScrollBox'); let parentCenter = parent.getBoundingClientRect().top + (parent.clientHeight / 2); let closestElem = null; let closestDist = Infinity; parent.querySelectorAll('.time-opt-item').forEach(item => { let box = item.getBoundingClientRect(); let itemCenter = box.top + (box.height / 2); let dist = Math.abs(parentCenter - itemCenter); if(dist < closestDist) { closestDist = dist; closestElem = item; } }); if(closestElem && !closestElem.classList.contains('selected')) { parent.querySelectorAll('.time-opt-item').forEach(i => i.classList.remove('selected')); closestElem.classList.add('selected'); } }, 150);
    }
    function saveSelectedTime() { let h = document.getElementById('hourScrollBox').querySelector('.selected').getAttribute('data-val'); let m = document.getElementById('minuteScrollBox').querySelector('.selected').getAttribute('data-val'); document.getElementById(activeTimeInputTargetId).value = `${h}:${m}`; closeTimeModal();
    }

    async function fetchFacilitiesData() { try { let r = await fetch(GAS_API_URL + "?action=getFacilities");
        globalFacilitiesDatabase = await r.json(); } catch (e) { } }
    function openFacilitySelection(targetInputId) { activeFacilityTargetInput = targetInputId; renderFacilitiesCapsules();
        document.getElementById('facilityModal').classList.add('open'); pushBackButtonHandler('facilityModal'); }
    function closeFacilityModal(fromPopState = false) { document.getElementById('facilityModal').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    function renderFacilitiesCapsules() { let html = "";
        if (globalFacilitiesDatabase.length === 0) html = `<div style="width:100%; text-align:center;">Data tidak ditemukan.</div>`;
        else { globalFacilitiesDatabase.forEach(item => { let isActiveClass = selectedFasilitasArray.includes(item.nama) ? 'active' : ''; let iconImg = item.icon ? item.icon : "https://cdn-icons-png.flaticon.com/512/744/744465.png"; html += `<div class="capsule-btn ${isActiveClass}" onclick="toggleFacilityItem('${item.nama}')"><img src="${iconImg}"><span>${item.nama}</span></div>`; });
        } document.getElementById('facilityCapsuleContainer').innerHTML = html; }
    function toggleFacilityItem(nama) { let index = selectedFasilitasArray.indexOf(nama);
        if (index > -1) selectedFasilitasArray.splice(index, 1); else selectedFasilitasArray.push(nama); renderFacilitiesCapsules(); }
    function saveSelectedFacilities() { if(activeFacilityTargetInput) { document.getElementById(activeFacilityTargetInput).value = selectedFasilitasArray.join(", ");
        } closeFacilityModal(); renderFormFacilitiesPreview(); }
    function renderFormFacilitiesPreview() { let previewHtml = "";
        let targetContainer = activeFacilityTargetInput === 'addFasilitas' ? 'addFasilitasPreviewContainer' : 'editFasilitasPreviewContainer';
        selectedFasilitasArray.forEach(nama => { let found = globalFacilitiesDatabase.find(f => f.nama === nama); let iconUrl = found && found.icon ? found.icon : "https://cdn-icons-png.flaticon.com/512/744/744465.png"; previewHtml += `<div class="facility-preview-chip"><img src="${iconUrl}" style="width:14px; height:14px; object-fit:contain;"><span>${nama}</span></div>`; });
        if(document.getElementById(targetContainer)) { document.getElementById(targetContainer).innerHTML = previewHtml; } }
    function buildCardFacilityImages(fasilitasString) { if(!fasilitasString) return '<span style="color:#94a3b8; font-size:12px;">Standard</span>';
        let list = fasilitasString.split(",").map(f => f.trim()); let imagesHtml = "";
        list.forEach(namaFasilitas => { let match = globalFacilitiesDatabase.find(g => g.nama.toLowerCase() === namaFasilitas.toLowerCase()); let src = match && match.icon ? match.icon : "https://cdn-icons-png.flaticon.com/512/744/744465.png"; imagesHtml += `<img class="ticket-facility-img" src="${src}" title="${namaFasilitas}">`; });
        return imagesHtml; }

    async function fetchSkemaData() {
        try {
            let r = await fetch(GAS_API_URL + "?action=getSkema");
            let list = await r.json();
            if (list && list.length > 0) { globalSkemaList = list; renderSkemaOptions();
            }
        } catch (e) { console.error("Gagal load skema", e);
        }
    }

    function renderSkemaOptions() {
        let html = "";
        if (globalSkemaList && globalSkemaList.length > 0) {
            globalSkemaList.forEach((item) => { html += `<div class="custom-option" style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s;" onclick="selectSkemaValue('${item.nama}')">${item.nama}</div>`; });
        } else { html = `<div class="custom-option" style="padding: 12px 16px;">Tidak ada data skema</div>`;
        }
        let el = document.getElementById('skemaSelectOptions'); if (el) el.innerHTML = html;
    }

    function selectSkemaValue(nama) {
        selectedSkemaValue = nama;
        let elText = document.getElementById('selectedSkemaText');
        if (elText) { elText.innerText = nama; elText.style.color = "#ffffff"; elText.style.fontWeight = "700";
        }
        let elOpts = document.getElementById('skemaSelectOptions'); if (elOpts) elOpts.classList.remove('open');
    }

    async function handleRegister() { const namaLengkap = document.getElementById('regNama').value.trim(); const username = document.getElementById('regUser').value.trim(); const email = document.getElementById('regEmail').value.trim();
        const noHp = document.getElementById('regHp').value.trim(); const alamatLengkap = document.getElementById('regAlamat').value.trim(); const password = document.getElementById('regPass').value.trim();
        if(!namaLengkap || !username || !email || !noHp || !alamatLengkap || !password) { showAlert("Gagal", "Semua kolom wajib diisi!", "fa-circle-exclamation", true); return;
        } if(!/^[A-Z](?=.*[a-zA-Z])(?=.*\d).{7,}$/.test(password)) { showAlert("Kata Sandi Lemah", "Minimal 8 karakter, diawali huruf besar, kombinasi huruf & angka.", "fa-shield-halved", true); return;
        } showLoading(true); try { let res = await fetchGAS({ action: "register", namaLengkap, username, email, noHp, alamatLengkap, password }); showLoading(false);
        if(res.status === "success") { showAlert("Sukses!", res.message, "fa-circle-check"); setTimeout(() => switchPage('pageLogin'), 1500); } else { showAlert("Gagal", res.message, "fa-circle-xmark", true);
        } } catch(e) { showLoading(false); showAlert("Koneksi Error", e.message, "fa-wifi", true);
        } }
    
   async function handleLogin() { 
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value.trim(); 
        if(!username || !password) { showAlert("Akses Ditolak", "Isi username dan password.", "fa-lock", true); return;
        } 
        showLoading(true);
        try { 
            let res = await fetchGAS({ action: "login", username, password });
            showLoading(false); 
            if(res.status === "success") { 
                SESSION_USER = res.user;
                globalPaketList = res.paket || []; globalRekeningList = res.rekening || []; serverTimeDelta = new Date(res.serverTime).getTime() - new Date().getTime();
                if(res.hasCompany) { 
                    SESSION_COMPANY = res.company;
                    localStorage.setItem('goBorneo_partner_session', JSON.stringify({ user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: res.serverTime }));
                    initNotifUI();
                    populateDashboardData(); switchPage('pageMainApp'); switchSubView('layanan'); loadLayananData(); startSubscriptionTimer(); startRealtimeExpirySync();
                    if(!pesananPollingInterval) { pesananPollingInterval = setInterval(fetchPesananDataSilently, 5000); }
                    if(isSubscriptionExpired() || SESSION_USER.hasPendingPayment) { setTimeout(() => { showSubscriptionModal(true); }, 2000);
                    }
                } else { 
                    localStorage.setItem('goBorneo_partner_session', JSON.stringify({ user: SESSION_USER, paket: globalPaketList, rekening: globalRekeningList, serverTime: res.serverTime }));
                    switchPage('pageOnboarding');
                } 
            } else { showAlert("Login Gagal", res.message, "fa-triangle-exclamation", true);
            } 
        } catch(e) { showLoading(false); showAlert("Error Script", e.message, "fa-server", true);
        } 
    }
    
    async function handleCompanyRegister() { 
        const n = document.getElementById('compNama').value.trim();
        const d = document.getElementById('compDesc').value.trim(); const h = document.getElementById('compHp').value.trim(); const a = document.getElementById('compAlamat').value.trim();
        if(!n || !d || !h || !a) { showAlert("Belum Lengkap", "Isi seluruh profil perusahaan.", "fa-building", true); return;
        } 
        if(!base64CompLogo) { showAlert("Logo Wajib", "Upload logo perusahaan.", "fa-image", true); return;
        } 
        if(!selectedSkemaValue) { showAlert("Pilih Skema", "Pilih skema pembayaran terlebih dahulu.", "fa-handshake", true);
        return; }
        
        showLoading(true);
        try { 
            let res = await fetchGAS({ action: "registerCompany", username: SESSION_USER.username, namaPerusahaan: n, deskripsiPerusahaan: d, noHpPerusahaan: h, alamatPerusahaan: a, logo: base64CompLogo, skemaPembayaran: selectedSkemaValue });
            showLoading(false); 
            
            if(res.status === "success") { 
                SESSION_COMPANY = { namaPerusahaan: n, deskripsiPerusahaan: d, logo: base64CompLogo, noHpPerusahaan: h, alamatPerusahaan: a, skemaPembayaran: selectedSkemaValue, saldo: 0, komisiRate: 0 };
                if (res.expiredAt) {
                    SESSION_USER.expiredAt = res.expiredAt;
                    SESSION_USER.isTrial = true;
                }

                localStorage.setItem('goBorneo_partner_session', JSON.stringify({ user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: new Date(new Date().getTime() + serverTimeDelta).toISOString() }));
                initNotifUI();
                populateDashboardData(); switchPage('pageMainApp'); switchSubView('layanan'); loadLayananData(); startSubscriptionTimer(); startRealtimeExpirySync(); 
                if(!pesananPollingInterval) { pesananPollingInterval = setInterval(fetchPesananDataSilently, 5000);
                }

                if (res.isTrialBaru) {
                    showAlert("Pemberitahuan", `Selamat datang dalam mode uji coba selama ${res.trialDays} Hari. Silahkan berlangganan jika masa uji coba telah habis.`, "fa-info-circle");
                }
            } else { showAlert("Gagal", res.message, "fa-circle-xmark", true);
            } 
        } catch(e) { showLoading(false); showAlert("Koneksi Error", e.message, "fa-wifi", true);
        } 
    }

    async function loadLayananData() { if(!SESSION_USER) return;
        const container = document.getElementById('layananCardContainer');
        try { let result = await fetchGAS({ action: "getLayanan", username: SESSION_USER.username, email: SESSION_USER.email });
        if(result.status === "success" && result.data.length > 0) { result.data.reverse(); globalLayananList = result.data;
        let htmlCards = `<h3 style="margin: 0 0 16px 0; font-size:15px; font-weight:700; color:#475569;">Armada & Jadwal Aktif</h3>`; let delay = 0;
        let todayObj = new Date(); let localOffset = todayObj.getTimezoneOffset() * 60000; let localISODate = new Date(todayObj.getTime() - localOffset).toISOString().split('T')[0];
        globalLayananList.forEach((item, idx) => { let durasiStr = hitungDurasi(item.jamBerangkat, item.jamSampai); let imgTopSrc = item.foto ? item.foto : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"; let imgIconsHtml = buildCardFacilityImages(item.fasilitas); let offDaysList = item.tanggalLibur ? item.tanggalLibur.split(',').map(d => d.trim()) : []; let isOffToday = offDaysList.includes(localISODate); let ribbonClass = isOffToday ? "non-aktif" : "aktif"; let ribbonText = isOffToday ? "Libur Hari Ini" : "Beroperasi"; htmlCards += `<div class="ticket-card" style="animation-delay: ${delay}s"><div class="ticket-img-top"><div class="status-ribbon ${ribbonClass}">${ribbonText}</div><img src="${imgTopSrc}" alt="Foto Armada"></div><div class="ticket-card-body"><div class="ticket-header"><div class="ticket-brand"><h3>${SESSION_COMPANY.namaPerusahaan}</h3><span>${item.merk} <div class="ticket-rating"><i class="fa-solid fa-star"></i> 4.8</div></span></div><div class="ticket-price-box"><div class="ticket-price">${formatRupiah(item.harga)}<span style="font-size: 12px; color: #80919D"> /Kursi</span></div><div class="ticket-seats-info-new"><i class="fa-solid fa-chair" style="color:#0284c7;"></i> ${item.kapasitas} Kursi Tersedia</div></div></div><div class="ticket-timeline-new"><div class="tl-time"><div>${item.jamBerangkat}</div><div class="tl-duration">${durasiStr}</div><div>${item.jamSampai}</div></div><div class="tl-center"><i class="fa-regular fa-circle-dot icon-origin"></i><div class="tl-line"></div><i class="fa-solid fa-location-dot icon-dest"></i></div><div class="tl-location"><div class="tl-loc-text">Titik Kumpul: <b>${item.asal}</b></div><div class="tl-loc-text">Tujuan Akhir: <b>${item.tujuan}</b></div></div></div><div style="border-top: 1px dashed #e2e8f0; margin: 12px 0;"></div><h4 style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">Fasilitas:</h4><div class="ticket-footer" style="background:transparent; padding:0;"><div class="facilities-wrapper"><div class="facilities-icons">${imgIconsHtml}</div><button class="settings-btn" onclick="openPengaturanDrawer(${idx})">Pengaturan</button></div></div></div></div>`; delay += 0.08; }); container.innerHTML = htmlCards; document.getElementById('stat-total-armada').innerText = globalLayananList.length; } else { document.getElementById('stat-total-armada').innerText = 0; container.innerHTML = `<div class="empty-state" style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-bus-slash" style="font-size:40px; margin-bottom:12px;"></i><p>Belum ada armada.</p></div>`; } } catch(e) { container.innerHTML = `<div style="text-align: center; margin-top: 40px; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat armada.</div>`; } }

    async function loadPesananData() { if(!SESSION_COMPANY) return; const container = document.getElementById('pesananCardContainer'); container.innerHTML = `<div style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px; font-weight:600;">Memuat tiket masuk...</p></div>`; try { let response = await fetch(GAS_API_URL + "?action=getPartnerOrders&perusahaan=" + encodeURIComponent(SESSION_COMPANY.namaPerusahaan)); let result = await response.json(); globalPesananList = result; renderPesananCards(result); renderNotifications(); if (orderChartInstance) { let activeType = document.querySelector('.chart-filter-btn.active').id.replace('btn-chart-',''); updateChartFilter(activeType); } } catch(e) { container.innerHTML = `<div style="text-align: center; margin-top: 40px; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat pesanan.</div>`; } }
    
    async function fetchPesananDataSilently() { 
        if(!SESSION_COMPANY) return; 
        try { 
            let response = await fetch(GAS_API_URL + "?action=getPartnerOrders&perusahaan=" + encodeURIComponent(SESSION_COMPANY.namaPerusahaan)); 
            let result = await response.json(); 
            
        
            if (globalPesananList.length > 0 && result.length > globalPesananList.length) {
                let newOrders = result.filter(r => !globalPesananList.some(g => g.idBooking === r.idBooking));
                if (newOrders.length > 0) {
                    let userOrdersCount = newOrders.filter(o => o.role !== "Mitra" && !o.isManualLocal).length;
                    let mitraOrdersCount = newOrders.filter(o => o.role === "Mitra" || o.isManualLocal).length;

                    if (userOrdersCount > 0) {
                        showAlert("Pesanan Baru Masuk", `Terdapat ${userOrdersCount} pesanan baru dari User.`, "fa-bell");
                    }
                    if (mitraOrdersCount > 0) {
                        setTimeout(() => {
                            showAlert("Pesanan Baru Masuk", `Terdapat ${mitraOrdersCount} Pesanan baru telah ditambahkan oleh Mitra.`, "fa-bell");
                        }, userOrdersCount > 0 ? 4000 : 0);
                    }
      
                    let bellBtn = document.getElementById('bellNotifBtn');
                    if (bellBtn) {
                        bellBtn.classList.remove('shake-anim');
                       
                        void bellBtn.offsetWidth;
                        bellBtn.classList.add('shake-anim');
                    }
                }
            }

            if(JSON.stringify(globalPesananList) !== JSON.stringify(result)) { 
                globalPesananList = result;
                renderPesananCards(result);
                renderNotifications();
                filterPesananMobile();
                if (orderChartInstance) { 
                    let activeType = document.querySelector('.chart-filter-btn.active').id.replace('btn-chart-','');
                    updateChartFilter(activeType); 
                } 
                if(document.getElementById('pageAksesKursi').classList.contains('open')) { 
                    renderSeatLayout();
                } 
            } 
        } catch(e) { console.error("Gagal sinkronisasi data pesanan real-time:", e);
        } 
    }

    function renderPesananCards(dataList) { const container = document.getElementById('pesananCardContainer'); let filteredList = dataList;
        if(currentPesananFilter === 'mitra') filteredList = dataList.filter(o => o.role === "Mitra" || o.isManualLocal);
        else if (currentPesananFilter === 'user') filteredList = dataList.filter(o => o.role !== "Mitra" && !o.isManualLocal); let filterText = "Semua Pesanan";
        if(currentPesananFilter === 'mitra') filterText = "Pesanan Mitra"; if(currentPesananFilter === 'user') filterText = "Pesanan User";
        let headerHtml = `<div class="order-header-wrapper" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; position: relative; z-index: 20;"><h3 class="order-header-title" style="margin: 0; font-size:15px; font-weight:700; color:#475569;">Manajemen Tiket Masuk</h3><div class="filter-dropdown" id="orderFilterMenu"><div class="filter-trigger" onclick="toggleOrderFilter()"><i class="fa-solid fa-filter"></i> <span>${filterText}</span> <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i></div><div class="filter-menu"><div class="filter-option ${currentPesananFilter === 'all' ? 'active' : ''}" onclick="setPesananFilter('all')">Semua Pesanan <i class="fa-solid fa-check check"></i></div><div class="filter-option ${currentPesananFilter === 'user' ? 'active' : ''}" onclick="setPesananFilter('user')">Pesanan User <i class="fa-solid fa-check check"></i></div><div class="filter-option ${currentPesananFilter === 'mitra' ? 'active' : ''}" onclick="setPesananFilter('mitra')">Pesanan Mitra <i class="fa-solid fa-check check"></i></div></div></div></div>`;
        let htmlCards = headerHtml; if (filteredList.length > 0) { let delay = 0;
        filteredList.forEach(order => { htmlCards += generateTicketCardHTML(order, false, delay); delay += 0.08; });
        } else { htmlCards += `<div class="empty-state" style="text-align:center; padding: 40px 0; color:#94a3b8;"><i class="fa-solid fa-ticket" style="font-size:40px; margin-bottom:12px;"></i><p>Belum ada tiket pesanan masuk.</p></div>`;
        } container.innerHTML = htmlCards; updateDashboardPesananStats(); }
    
    function generateTicketCardHTML(order, isPopupDrawer = false, delay = 0) { 
        let isPaid = order.statusBooking.toLowerCase() === "lunas";
        let isDitolak = order.statusBooking.toLowerCase() === "ditolak" || order.statusBooking.toLowerCase() === "tolak";
        let isManual = (order.role === "Mitra") || order.isManualLocal;
        let statusClass = "non-aktif";
        let statusText = "BELUM BAYAR";

        if (isPaid) {
            statusClass = "aktif";
            statusText = "LUNAS";
        } else if (isDitolak) {
            statusClass = "ditolak";
            statusText = "DITOLAK";
        } else {
            if (isManual) {
                statusClass = "non-aktif";
                // default CSS red bg
                statusText = "BELUM BAYAR";
            } else {
                statusClass = "pending-orange";
                // custom CSS orange bg
                statusText = "TRANSFER PENDING";
            }
        }

        let tglBooking = formatTglIndo(order.tanggalBooking);
        let manualBadge = isManual ?
        `<div class="badge-manual"><i class="fa-solid fa-bolt"></i> Manual</div>` : ''; 
        let suffix = isPopupDrawer ? "-popup" : "";
        let actionBtn = isPaid || isDitolak ?
        '' : `<button id="btn-confirm-${order.idBooking}${suffix}" class="settings-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:white; box-shadow:0 4px 10px rgba(16,185,129,0.3); z-index: 12;"
        onclick="event.stopPropagation(); openPaymentModal('${order.idBooking}')"><i class="fa-solid fa-hand-holding-dollar"></i> Konfirmasi</button>`;
        
        let cardOnClick = !isPopupDrawer ?
        `onclick="openTicketDetail('${order.idBooking}')" style="cursor:pointer; opacity: 0; animation: fadeIn 0.5s forwards; animation-delay: ${delay}s;"` : `style="box-shadow:none; border: 1px solid #e2e8f0; margin-bottom: 0;"`;
        return `<div class="ticket-card pesanan-card-item" id="ticketCard-${order.idBooking}${suffix}" ${cardOnClick}><div class="ticket-card-body" style="padding-top: 15px; position: relative;"><div class="ticket-header" style="margin-bottom:8px;"><div class="ticket-brand"><h3 style="color:#89a37b; font-size:16px;">${order.idBooking}</h3><span><i class="fa-solid fa-user" style="color:#cbd5e1;"></i> <b style="color:var(--text-main); margin-left:4px; text-transform:capitalize;">${order.namaPenumpang}</b> ${manualBadge}</span><span style="font-size:10px; margin-top:2px;"><i class="fa-solid fa-phone" style="color:#cbd5e1;"></i> <span style="margin-left:4px;">0${order.noHp}</span></span></div><div class="ticket-price-box"><div class="ticket-price">Rp.
        ${formatNumber(order.harga)}</div><div style="font-size: 11px; font-weight: 700; color: #64748b; margin: 4px 0;"><i class="fa-solid fa-bus"></i> ${order.merkKendaraan}</div><div class="ticket-seats-info-new" style="margin-top: 0;"><i class="fa-solid fa-chair" style="color:#0284c7;"></i> Kursi: <b>${order.nomorKursi}</b></div></div></div><div class="ticket-timeline-new" style="margin-top:10px; margin-bottom:8px;"><div class="tl-center" style="margin-left:0;"><i class="fa-regular fa-circle-dot icon-origin"></i><div class="tl-line"></div><i class="fa-solid fa-location-dot icon-dest"></i></div><div class="tl-location"><div class="tl-loc-text">Naik: <b>${order.asal}</b></div><div class="tl-loc-text">Turun: <b>${order.tujuan}</b></div></div></div><div style="margin-top:12px; display: flex; justify-content: flex-end;"><div class="modern-date-badge"><span style="color: black"> Tanggal Berangkat:</span><i class="fa-regular fa-calendar-check"></i> ${tglBooking}</div></div><div class="ticket-footer" style="background:transparent; padding:0; margin-top:20px; position: relative; height: 35px; display: flex; align-items: center; justify-content: flex-end;"><div id="badge-${order.idBooking}${suffix}" class="status-ribbon-bottom-left ${statusClass}">${statusText}</div>${actionBtn}</div></div></div>`; }

    async function openAddService() { 
        if(isKomisiScheme() && SESSION_COMPANY.saldo <= 0) { 
            return showAlert("Peringatan", "Maaf, saldo anda tidak mencukupi untuk membayar komisi aplikasi. Anda tidak dapat menambahkan armada. Silahkan top up saldo terlebih dahulu.", "fa-triangle-exclamation", true); 
        }
        document.getElementById('pageAddService').classList.add('open'); pushBackButtonHandler('addService'); try { let response = await fetch(GAS_API_URL + "?action=getVehicleTypes"); let listJenis = await response.json(); let optionsHtml = listJenis.length > 
        0 ? listJenis.map(i => `<div class="custom-option" onclick="selectServiceType('${i.nama}', '${i.icon || "https://cdn-icons-png.flaticon.com/512/744/744465.png"}')"><img src="${i.icon || ""}"><span style="color:var(--text-main); font-weight:500;">${i.nama}</span></div>`).join("") : `<div class="custom-option">Tidak ada data.</div>`;
        document.getElementById('serviceTypeOptions').innerHTML = optionsHtml;
        } catch (e) { document.getElementById('serviceTypeOptions').innerHTML = `<div class="custom-option" style="color:#EF4444">Gagal memuat jenis.</div>`;
        } }
    function selectServiceType(namaJenis, iconUrl) { selectedVehicleTypeName = namaJenis; let isEdit = document.getElementById('pageEditService').classList.contains('open');
        let targetSpan = isEdit ? 'selectedEditServiceType' : 'selectedServiceType'; if(document.getElementById(targetSpan)){ document.getElementById(targetSpan).innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><img src="${iconUrl}" style="width:24px; height:24px; object-fit:contain; border-radius:4px;"><span style="font-weight:700; color:var(--text-main);">${namaJenis}</span></div>`;
        } if(document.getElementById('serviceTypeOptions')) document.getElementById('serviceTypeOptions').classList.remove('open'); if(document.getElementById('serviceEditTypeOptions')) document.getElementById('serviceEditTypeOptions').classList.remove('open'); if(document.getElementById('serviceTypeSelect')) document.getElementById('serviceTypeSelect').style.borderColor = "var(--primary)"; if(document.getElementById('serviceEditTypeSelect')) document.getElementById('serviceEditTypeSelect').style.borderColor = "var(--primary)";
    }
    function closeAddServiceAndReset(fromPopState = false) { document.getElementById('selectedServiceType').innerHTML = "<span>Pilih Tipe Kendaraan...</span>"; selectedVehicleTypeName = ""; selectedFasilitasArray = [];
        document.getElementById('addFasilitas').value = ""; document.getElementById('addFasilitasPreviewContainer').innerHTML = ""; ['addMerk','addKapasitas','addHarga','addAsal','addTujuan','addJamB','addJamS','addFotoFile'].forEach(id => document.getElementById(id).value = "");
        document.getElementById('previewAddFoto').src = ""; document.getElementById('previewAddFoto').style.display = 'none'; base64ArmadaFoto = "";
        document.getElementById('pageAddService').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    async function submitNewService() { const d = { jenis: selectedVehicleTypeName, merk: document.getElementById('addMerk').value.trim(), fasilitas: document.getElementById('addFasilitas').value.trim(), kapasitas: document.getElementById('addKapasitas').value.trim(), harga: document.getElementById('addHarga').value.trim(), asal: document.getElementById('addAsal').value.trim(), tujuan: document.getElementById('addTujuan').value.trim(), jamBerangkat: document.getElementById('addJamB').value, jamSampai: document.getElementById('addJamS').value };
        if(!d.jenis || !d.merk || !d.fasilitas || !d.kapasitas || !d.harga || !d.asal || !d.tujuan || !d.jamBerangkat || !d.jamSampai) { showAlert("Belum Lengkap", "Isi seluruh spesifikasi jadwal.", "fa-triangle-exclamation", true);
        return; } if(!base64ArmadaFoto) { showAlert("Foto Wajib", "Upload foto armada.", "fa-camera", true); return; } showLoading(true);
        const payload = { action: "addService", username: SESSION_USER.username, email: SESSION_USER.email, namaPerusahaan: SESSION_COMPANY.namaPerusahaan, foto: base64ArmadaFoto, ...d };
        try { let result = await fetchGAS(payload); showLoading(false); if(result.status === "success") { showAlert("Berhasil", "Armada ditambahkan.", "fa-circle-check"); closeAddServiceAndReset(); loadLayananData();
        } else { showAlert("Gagal", result.message, "fa-circle-xmark", true); } } catch(e) { showLoading(false); showAlert("Koneksi Error", e.message, "fa-wifi", true);
        } }

    function openPengaturanDrawer(idx) { activeLayananIndex = idx; const item = globalLayananList[idx];
        document.getElementById('pengaturanModalTitle').innerText = "Pengaturan " + item.merk; currentCalYear = new Date().getFullYear(); currentCalMonth = new Date().getMonth(); document.getElementById('pengaturanModal').classList.add('open'); renderCalendarWidget(); pushBackButtonHandler('pengaturanModal');
    }
    function closePengaturanModal(fromPopState = false) { document.getElementById('pengaturanModal').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    function renderCalendarWidget() { const item = globalLayananList[activeLayananIndex]; let offDatesArray = item.tanggalLibur ?
        item.tanggalLibur.split(',').map(d => d.trim()).filter(Boolean) : []; const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        if(document.getElementById('calMonthYearTitle')) document.getElementById('calMonthYearTitle').innerText = `${monthNames[currentCalMonth]} ${currentCalYear}`; let firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
        let daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate(); let gridHtml = `<div style="font-size:10px; font-weight:700; color:#94a3b8;">Min</div><div style="font-size:10px; font-weight:700; color:#94a3b8;">Sen</div><div style="font-size:10px; font-weight:700; color:#94a3b8;">Sel</div><div style="font-size:10px; font-weight:700; color:#94a3b8;">Rab</div><div style="font-size:10px; font-weight:700; color:#94a3b8;">Kam</div><div style="font-size:10px; font-weight:700; color:#94a3b8;">Jum</div><div style="font-size:10px; font-weight:700; color:#94a3b8;">Sab</div>`;
        for (let i = 0; i < firstDay; i++) gridHtml += `<div></div>`;
        for (let day = 1; day <= daysInMonth; day++) { let mStr = (currentCalMonth + 1).toString().padStart(2, '0');
        let dStr = day.toString().padStart(2, '0'); let fullDateStr = `${currentCalYear}-${mStr}-${dStr}`; let isOff = offDatesArray.includes(fullDateStr); let bgStyle = isOff ?
        "background:#fef2f2; color:#ef4444; border:1px solid #fca5a5;" : "background:#f0fdf4; color:#22c55e; border:1px solid #86efac;"; let statusText = isOff ? "off" : "on";
        let statusColor = isOff ? "#ef4444" : "#22c55e"; gridHtml += `<div onclick="toggleMultipleChoiceDate('${fullDateStr}')" style="width:40px; height:46px; ${bgStyle} border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:auto; cursor:pointer; font-size:12px; font-weight:700; transition:all 0.1s ease;">${day}<div style="font-size:9px; font-weight:800; text-transform:uppercase; color:${statusColor}; margin-top:2px;">${statusText}</div></div>`;
        } if(document.getElementById('calendarGridWidget')) document.getElementById('calendarGridWidget').innerHTML = gridHtml; }
    function toggleMultipleChoiceDate(dateStr) { const item = globalLayananList[activeLayananIndex];
        let offDatesArray = item.tanggalLibur ? item.tanggalLibur.split(',').map(d => d.trim()).filter(Boolean) : []; let dateIdx = offDatesArray.indexOf(dateStr); if(dateIdx > -1) offDatesArray.splice(dateIdx, 1);
        else offDatesArray.push(dateStr); item.tanggalLibur = offDatesArray.join(','); renderCalendarWidget(); }
    function changeCalendarMonth(dir) { currentCalMonth += dir;
        if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; } else if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--;
        } renderCalendarWidget(); }
    async function saveCalendarSettings() { if(activeLayananIndex === -1) return; const item = globalLayananList[activeLayananIndex]; showLoading(true);
        try { let res = await fetchGAS({ action: "updateCalendar", username: SESSION_USER.username, email: SESSION_USER.email, merk: item.merk, jamBerangkat: item.jamBerangkat, tanggalLibur: item.tanggalLibur });
        showLoading(false); if(res.status === "success") { showAlert("Sukses", "Kalender diperbarui!", "fa-circle-check"); closePengaturanModal(); loadLayananData(); } else { showAlert("Gagal", res.message, "fa-circle-xmark", true);
        } } catch(e) { showLoading(false); showAlert("Koneksi Error", e.message, "fa-wifi", true);
        } }
    async function executeDeleteService() { if(activeLayananIndex === -1) return; const item = globalLayananList[activeLayananIndex]; showLoading(true);
        try { let res = await fetchGAS({ action: "deleteService", username: SESSION_USER.username, email: SESSION_USER.email, merk: item.merk, jamBerangkat: item.jamBerangkat }); showLoading(false);
        if(res.status === "success") { showAlert("Terhapus", "Data dihapus.", "fa-trash"); closePengaturanModal(); loadLayananData(); } else { showAlert("Gagal", res.message, "fa-circle-xmark", true);
        } } catch(e) { showLoading(false); showAlert("Koneksi Error", e.message, "fa-wifi", true); } }

    async function openEditLayananForm() { closePengaturanModal();
        try { const item = globalLayananList[activeLayananIndex]; oldMerkForEdit = item.merk; oldJamBForEdit = item.jamBerangkat; selectedVehicleTypeName = item.jenis; document.getElementById('editMerk').value = item.merk || '';
        document.getElementById('editKapasitas').value = item.kapasitas || ''; document.getElementById('editHarga').value = item.harga || ''; document.getElementById('editAsal').value = item.asal || ''; document.getElementById('editTujuan').value = item.tujuan || '';
        document.getElementById('editJamB').value = item.jamBerangkat || ''; document.getElementById('editJamS').value = item.jamSampai || ''; document.getElementById('editFasilitas').value = item.fasilitas || ''; selectedFasilitasArray = item.fasilitas ?
        item.fasilitas.split(',').map(f => f.trim()) : []; activeFacilityTargetInput = 'editFasilitas'; renderFormFacilitiesPreview(); let response = await fetch(GAS_API_URL + "?action=getVehicleTypes");
        let listJenis = await response.json(); let optionsHtml = listJenis.length > 0 ?
        listJenis.map(i => `<div class="custom-option" onclick="selectServiceType('${i.nama}', '${i.icon || "https://cdn-icons-png.flaticon.com/512/744/744465.png"}')"><img src="${i.icon || ""}"><span style="color:var(--text-main); font-weight:500;">${i.nama}</span></div>`).join("") : `<div class="custom-option">Tidak ada data.</div>`;
        document.getElementById('serviceEditTypeOptions').innerHTML = optionsHtml; let matchJenis = listJenis.find(j => j.nama === item.jenis); let defIconUrl = matchJenis && matchJenis.icon ?
        matchJenis.icon : "https://cdn-icons-png.flaticon.com/512/744/744465.png"; if (document.getElementById('selectedEditServiceType')) { document.getElementById('selectedEditServiceType').innerHTML = `<div style="display: flex; align-items: center; gap: 10px;"><img src="${defIconUrl}" style="width:24px; height:24px; object-fit:contain; border-radius:4px;"><span style="font-weight:700; color:var(--text-main);">${item.jenis}</span></div>`;
        } if(item.foto) { document.getElementById('previewEditFoto').src = item.foto; document.getElementById('previewEditFoto').style.display = 'block'; } else { document.getElementById('previewEditFoto').src = ""; document.getElementById('previewEditFoto').style.display = 'none';
        } base64ArmadaFoto = ""; document.getElementById('pageEditService').classList.add('open'); pushBackButtonHandler('editService'); } catch(e) { console.error("Gagal Render Edit Form: ", e);
        showAlert("Error", "Gagal memuat form edit.", "fa-triangle-exclamation", true); } }
    function closeEditLayananForm(fromPopState = false) { document.getElementById('pageEditService').classList.remove('open');
        if (!fromPopState) popBackButtonHandler(); }
    async function submitEditService() { const d = { jenis: selectedVehicleTypeName, merk: document.getElementById('editMerk').value.trim(), fasilitas: document.getElementById('editFasilitas').value.trim(), kapasitas: document.getElementById('editKapasitas').value.trim(), harga: document.getElementById('editHarga').value.trim(), asal: document.getElementById('editAsal').value.trim(), tujuan: document.getElementById('editTujuan').value.trim(), jamBerangkat: document.getElementById('editJamB').value, jamSampai: document.getElementById('editJamS').value };
        if(!d.jenis || !d.merk || !d.fasilitas || !d.kapasitas || !d.harga || !d.asal || !d.tujuan || !d.jamBerangkat || !d.jamSampai) { showAlert("Belum Lengkap", "Isi seluruh kolom edit.", "fa-triangle-exclamation", true);
        return; } showLoading(true); const payload = { action: "editService", username: SESSION_USER.username, email: SESSION_USER.email, oldMerk: oldMerkForEdit, oldJamBerangkat: oldJamBForEdit, foto: base64ArmadaFoto ||
        "", ...d }; try { let result = await fetchGAS(payload); showLoading(false); if(result.status === "success") { showAlert("Berhasil", "Spesifikasi diperbarui.", "fa-circle-check");
        base64ArmadaFoto = ""; closeEditLayananForm(); loadLayananData(); } else { showAlert("Gagal", result.message, "fa-circle-xmark", true); } } catch(e) { showLoading(false);
        showAlert("Koneksi Error", e.message, "fa-wifi", true); } }

    function openEditPribadi() { if(!SESSION_USER) return; document.getElementById('epNama').value = SESSION_USER.namaLengkap || '';
        document.getElementById('epHp').value = SESSION_USER.noHp || ''; document.getElementById('epAlamat').value = SESSION_USER.alamatLengkap || ''; document.getElementById('modalEditPribadi').classList.add('open'); pushBackButtonHandler('editPribadi');
    }
    function closeEditPribadi(fromPopState = false) { document.getElementById('modalEditPribadi').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    async function submitEditPribadi() { const nama = document.getElementById('epNama').value.trim(); const hp = document.getElementById('epHp').value.trim(); const alamat = document.getElementById('epAlamat').value.trim();
        if(!nama || !hp || !alamat) return showAlert("Perhatian", "Semua kolom wajib diisi", "fa-triangle-exclamation", true); showLoading(true);
        try { let res = await fetchGAS({ action: "editProfile", username: SESSION_USER.username, namaLengkap: nama, noHp: hp, alamatLengkap: alamat }); showLoading(false);
        if(res.status === "success") { SESSION_USER.namaLengkap = nama; SESSION_USER.noHp = hp; SESSION_USER.alamatLengkap = alamat;
        localStorage.setItem('goBorneo_partner_session', JSON.stringify({ user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: new Date(getServerAdjustedTime()).toISOString() })); populateDashboardData(); closeEditPribadi();
        showAlert("Sukses", "Profil Pribadi Diperbarui", "fa-check"); } else { showAlert("Gagal", res.message, "fa-xmark", true); } } catch(e) { showLoading(false);
        showAlert("Error", e.message, "fa-wifi", true); } }

    function openEditPerusahaan() { if(!SESSION_COMPANY) return; document.getElementById('ecNama').value = SESSION_COMPANY.namaPerusahaan || '';
        document.getElementById('ecHp').value = SESSION_COMPANY.noHpPerusahaan || ''; document.getElementById('ecDesc').value = SESSION_COMPANY.deskripsiPerusahaan || ''; document.getElementById('ecAlamat').value = SESSION_COMPANY.alamatPerusahaan || ''; let currentLogo = SESSION_COMPANY.logo ||
        ""; if(currentLogo) { document.getElementById('previewEditCompLogo').src = currentLogo; document.getElementById('previewEditCompLogo').style.display = 'block'; } else { document.getElementById('previewEditCompLogo').style.display = 'none'; } base64EditCompLogo = ""; document.getElementById('modalEditPerusahaan').classList.add('open');
        pushBackButtonHandler('editPerusahaan'); }
    function closeEditPerusahaan(fromPopState = false) { document.getElementById('modalEditPerusahaan').classList.remove('open'); if (!fromPopState) popBackButtonHandler();
    }
    async function submitEditPerusahaan() { const nama = document.getElementById('ecNama').value.trim(); const hp = document.getElementById('ecHp').value.trim(); const desc = document.getElementById('ecDesc').value.trim();
        const alamat = document.getElementById('ecAlamat').value.trim(); if(!nama || !hp || !desc || !alamat) return showAlert("Perhatian", "Semua kolom wajib diisi", "fa-triangle-exclamation", true); showLoading(true);
        try { let payloadData = { action: "editCompany", username: SESSION_USER.username, namaPerusahaan: nama, noHpPerusahaan: hp, deskripsiPerusahaan: desc, alamatPerusahaan: alamat, logo: base64EditCompLogo ||
        "" }; let res = await fetchGAS(payloadData); showLoading(false); if(res.status === "success") { SESSION_COMPANY.namaPerusahaan = nama; SESSION_COMPANY.noHpPerusahaan = hp;
        SESSION_COMPANY.deskripsiPerusahaan = desc; SESSION_COMPANY.alamatPerusahaan = alamat; if(base64EditCompLogo) SESSION_COMPANY.logo = base64EditCompLogo;
        localStorage.setItem('goBorneo_partner_session', JSON.stringify({ user: SESSION_USER, company: SESSION_COMPANY, paket: globalPaketList, rekening: globalRekeningList, serverTime: new Date(getServerAdjustedTime()).toISOString() })); populateDashboardData(); closeEditPerusahaan();
        showAlert("Sukses", "Profil Perusahaan Diperbarui", "fa-check"); } else { showAlert("Gagal", res.message, "fa-xmark", true); } } catch(e) { showLoading(false);
        showAlert("Error", e.message, "fa-wifi", true); } }

    function executeLogout() {
        closeAlert();
        if(pesananPollingInterval) { clearInterval(pesananPollingInterval); pesananPollingInterval = null; }
        if(seatPollingInterval) { clearInterval(seatPollingInterval); seatPollingInterval = null;
        }
        if(subscriptionCheckInterval) { clearInterval(subscriptionCheckInterval); subscriptionCheckInterval = null;
        }
        if(realtimeSyncInterval) { clearInterval(realtimeSyncInterval); realtimeSyncInterval = null;
        }
        
        document.getElementById('globalHeaderTimer').style.display = 'none';
        document.getElementById('mobileHeaderTimer').style.display = 'none';
        
        document.body.style.overflow = '';
        localStorage.removeItem('goBorneo_partner_session'); SESSION_USER = null; SESSION_COMPANY = null;
        globalPaketList = []; globalRekeningList = [];
        ['loginUser','loginPass','compDesc','compLogoFile'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; }); document.getElementById('descCounter').innerText = "0/50"; document.getElementById('previewCompLogo').src = ""; document.getElementById('previewCompLogo').style.display = "none";
        base64CompLogo = "";
        base64EditCompLogo = ""; base64ArmadaFoto = ""; document.getElementById('addFasilitasPreviewContainer').innerHTML = ""; globalLayananList = []; activeLayananIndex = -1; if(cropperInstance) cancelCrop();
        document.getElementById('subscriptionOverlay').classList.remove('show');
        
        switchSubView('layanan'); switchPage('pageLogin');
    }
