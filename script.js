/* =========================================
   1. INISIALISASI & LOADING
   ========================================= */
AOS.init({ duration: 1000, once: true });

window.totalHargaKeranjang = 0;

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("loader-hidden");
}

window.addEventListener("load", () => {
    hideLoader();
    inisialisasiFAQ();
    if(document.getElementById("popupPromo")) munculkanPopupPromo();
});

setTimeout(hideLoader, 3000); 

/* =========================================
   2. SISTEM NAVIGASI TAB
   ========================================= */
function openTab(evt, tabName) {
    const tabContent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("active-tab");
    }

    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active-tab");
    if (evt) evt.currentTarget.classList.add("active");

    window.scrollTo({ top: 0, behavior: 'smooth' });
    AOS.refresh();
}

/* =========================================
   3. MODAL & HARGA DINAMIS
   ========================================= */
const modal = document.getElementById("modalProduk");
let produkAktif = "";
let dataVarianAktif = {}; 

function bukaModal(nama, hargaDefault, dataVarian) {
    produkAktif = nama;
    dataVarianAktif = dataVarian; 
    
    document.getElementById("modalTitle").innerText = nama;
    document.getElementById("modalPrice").innerText = "Rp " + hargaDefault.toLocaleString('id-ID');
    document.getElementById("modalImg").src = dataVarian['default'].gbr;
    
    const inputJumlah = document.getElementById("jumlahPesanan");
    if(inputJumlah) inputJumlah.value = 1;

    let selectVarian = document.getElementById("varianPilihan");
    selectVarian.innerHTML = ""; 
    
    Object.keys(dataVarian).forEach(v => {
        if(v !== 'default') {
            let option = document.createElement("option");
            option.text = v; 
            option.value = v;
            selectVarian.add(option);
        }
    });
    modal.style.display = "block";
}

function gantiGambarVarian() {
    const varian = document.getElementById("varianPilihan").value;
    const imgElement = document.getElementById("modalImg");
    const priceElement = document.getElementById("modalPrice");
    
    const dataAset = dataVarianAktif[varian];

    imgElement.style.opacity = "0";
    setTimeout(() => {
        imgElement.src = dataAset.gbr;
        priceElement.innerText = "Rp " + dataAset.harga.toLocaleString('id-ID');
        imgElement.style.opacity = "1";
    }, 200);
}

function tutupModal() { if(modal) modal.style.display = "none"; }

/* =========================================
   4. LOGIKA KERANJANG BELANJA
   ========================================= */
let dataKeranjang = [];

function tambahKeKeranjang() {
    const varian = document.getElementById("varianPilihan").value;
    const jumlahInput = document.getElementById("jumlahPesanan");
    const jumlah = parseInt(jumlahInput.value) || 1; 
    
    const hargaTeks = document.getElementById("modalPrice").innerText;
    const hargaAngka = parseInt(hargaTeks.replace(/[^0-9]/g, ''));

    const itemBaru = {
        nama: produkAktif,
        varian: varian,
        jumlah: jumlah,
        harga: hargaAngka,
        subtotal: hargaAngka * jumlah
    };

    const cartCount = document.getElementById("cart-count");
cartCount.classList.add("jump");
setTimeout(() => { cartCount.classList.remove("jump"); }, 400);

    dataKeranjang.push(itemBaru);

    updateUIKeranjang();
    if (dataKeranjang.length === 0) {
    wadah.innerHTML = `
        <div style="padding: 40px 20px; opacity: 0.6;">
            <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 15px; color: #cbd5e0;"></i>
            <p>Dapur lagi sepi nih... <br>Yuk, isi dengan jajanan favoritmu!</p>
        </div>
    `;
    // ... sisa kodenya
}
    tutupModal();
    
    const cartIcon = document.getElementById("cart-icon");
    cartIcon.classList.add("shake");
    setTimeout(() => { cartIcon.classList.remove("shake"); }, 600);

    const toast = document.getElementById("toast");
    if(toast) {
        toast.innerHTML = `
            <div>✅ <strong>${produkAktif}</strong> berhasil ditambah!</div>
            <div onclick="bukaModalKeranjang()" class="btn-lihat-keranjang">LIHAT KERANJANG & CHECKOUT</div>
        `;
        toast.style.display = "block";
        setTimeout(() => { toast.style.display = "none"; }, 4000);
    }
}


function updateProgressOngkir(total) {
    const bar = document.getElementById("shipping-bar");
    const teks = document.getElementById("shipping-text");
    const target = 50000;
    const persen = Math.min((total / target) * 100, 100);
    
    if(bar) bar.style.width = persen + "%";
    
    if (total >= target) {
        teks.innerHTML = "🎉 Selamat! Kamu sudah dapat <strong>Gratis Ongkir</strong>";
        bar.style.background = "#25d366";
    } else {
        const kurang = target - total;
        teks.innerHTML = `Tambah <strong>Rp ${kurang.toLocaleString('id-ID')}</strong> lagi buat Gratis Ongkir!`;
        bar.style.background = "#f6ad55";
    }
}
// Panggil updateProgressOngkir(totalSeluruhnya) di dalam updateUIKeranjang

function updateUIKeranjang() {
    const wadah = document.getElementById("isi-keranjang");
    const countTag = document.getElementById("cart-count");
    const totalTag = document.getElementById("text-total");
    const btnCheckout = document.getElementById("btn-checkout");
    const areaTotal = document.getElementById("total-bayar");
    
    // Elemen Bar Ongkir
    const bar = document.getElementById("shipping-bar");
    const teks = document.getElementById("shipping-text");
    const target = 50000;


    

    countTag.innerText = dataKeranjang.length;

    if (dataKeranjang.length === 0) {
        // Tampilan kalau keranjang kosong (Pakai ikon DKV kamu)
        wadah.innerHTML = `
            <div style="padding: 40px 20px; opacity: 0.6; text-align: center;">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 15px; color: #cbd5e0;"></i>
                <p>Dapur lagi sepi nih... <br>Yuk, isi dengan jajanan favoritmu!</p>
            </div>
        `;
        btnCheckout.style.display = "none";
        areaTotal.style.display = "none";
        window.totalHargaKeranjang = 0;

        // Reset Bar Ongkir ke 0
        if(bar) bar.style.width = "0%";
        if(teks) teks.innerHTML = `Tambah <strong>Rp 50.000</strong> lagi buat Gratis Ongkir!`;
        
    } else {
        let htmlKeranjang = "";
        let totalSeluruhnya = 0;

        dataKeranjang.forEach((item, index) => {
            totalSeluruhnya += item.subtotal;
            htmlKeranjang += `
                <div class="item-keranjang">
                    <div style="text-align:left;">
                        <strong>${item.nama}</strong><br>
                        <small>${item.varian} x ${item.jumlah} pcs</small>
                    </div>
                    <div style="text-align:right;">
                        Rp ${item.subtotal.toLocaleString('id-ID')}
                        <i class="fas fa-minus-circle hapus-item" onclick="hapusItemKeranjang(${index})" title="Kurangi satu"></i>
                    </div>
                </div>
            `;
        });

        wadah.innerHTML = htmlKeranjang;
        totalTag.innerText = "Rp " + totalSeluruhnya.toLocaleString('id-ID');
        btnCheckout.style.display = "block";
        areaTotal.style.display = "flex";
        window.totalHargaKeranjang = totalSeluruhnya;

        // UPDATE BAR ONGKIR OTOMATIS DI SINI
        if(bar && teks) {
            const persen = Math.min((totalSeluruhnya / target) * 100, 100);
            bar.style.width = persen + "%";
            
           // Tambahkan ini di dalam logika If Gratis Ongkir di script.js
if (totalSeluruhnya >= target && !window.alreadyCelebrated) {
    launchConfetti(); // Fungsi ledakan perayaan
    window.alreadyCelebrated = true; // Biar nggak meledak terus-terusan
} else if (totalSeluruhnya < target) {
    window.alreadyCelebrated = false;
}

function launchConfetti() {
    // Efek sederhana: getarkan ikon keranjang dengan keras
    const icon = document.getElementById("cart-icon");
    icon.style.transform = "scale(2) rotate(20deg)";
    setTimeout(() => { icon.style.transform = "scale(1) rotate(0deg)"; }, 500);
    
    // Tampilkan pesan spesial di tengah layar sebentar
    const celebrate = document.createElement("div");
    celebrate.innerHTML = "🎉 GRATIS ONGKIR UNLOCKED! 🎉";
    celebrate.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#25d366; color:white; padding:20px; border-radius:50px; z-index:10005; font-weight:bold; animation: slideUp 0.5s;";
    document.body.appendChild(celebrate);
    setTimeout(() => { celebrate.remove(); }, 2000);
}
        }
    }
    if(document.getElementById('pilihWilayah')) hitungOngkir();
}

function hapusItemKeranjang(index) {
    if (dataKeranjang[index].jumlah > 1) {
        dataKeranjang[index].jumlah -= 1;
        dataKeranjang[index].subtotal = dataKeranjang[index].jumlah * dataKeranjang[index].harga;
    } else {
        dataKeranjang.splice(index, 1);
    }
    updateUIKeranjang();
}

function bukaModalKeranjang() { document.getElementById("modalKeranjang").style.display = "block"; }
function tutupModalKeranjang() { document.getElementById("modalKeranjang").style.display = "none"; }

/* =========================================
   5. WHATSAPP & FAQ & ONGKIR
   ========================================= */
function hitungOngkir() {
    const select = document.getElementById('pilihWilayah');
    const hasilBox = document.getElementById('hasilOngkir');
    const teksOngkir = document.getElementById('teksOngkir');
    const promoOngkir = document.getElementById('promoOngkir');
    const btnWa = document.getElementById('btnWaOngkir');
    
    if(!select || !hasilBox) return;

    let hargaOngkir = parseInt(select.value);
    const wilayah = select.options[select.selectedIndex].text;
    const minimalBelanja = 50000; 
    let totalBelanjaSaatIni = window.totalHargaKeranjang || 0;

    if (select.value === "0" && !wilayah.includes("Gratis")) {
        hasilBox.style.display = "none";
        return;
    }

    hasilBox.style.display = "block";

    if (totalBelanjaSaatIni >= minimalBelanja) {
        teksOngkir.innerHTML = `<strike style='color:red'>Rp ${hargaOngkir.toLocaleString('id-ID')}</strike> Gratis Ongkir! 🎉`;
        promoOngkir.innerText = "✅ Selamat! Kamu dapat Gratis Ongkir.";
        hargaOngkir = 0; 
    } else {
        teksOngkir.innerText = "Rp " + hargaOngkir.toLocaleString('id-ID');
        const kekurangan = minimalBelanja - totalBelanjaSaatIni;
        promoOngkir.innerText = `💡 Tambah Rp ${kekurangan.toLocaleString('id-ID')} lagi untuk Gratis Ongkir!`;
    }

    const pesan = `Halo Dapur Putri, saya mau pesan ke ${wilayah}. Total belanja saya Rp ${totalBelanjaSaatIni.toLocaleString('id-ID')} dan ongkirnya ${hargaOngkir === 0 ? 'Gratis' : 'Rp ' + hargaOngkir}.`;
    btnWa.href = `https://wa.me/6285972553371?text=${encodeURIComponent(pesan)}`;
}

function checkoutWA() {
    if (dataKeranjang.length === 0) return;
    let listPesanan = "";
    let totalAkhir = 0;

    dataKeranjang.forEach((item) => {
        listPesanan += `- *${item.nama}* (${item.varian}) x ${item.jumlah} pcs = Rp ${item.subtotal.toLocaleString('id-ID')}%0A`;
        totalAkhir += item.subtotal;
    });

    const pesan = `Halo Dapur Putri,%0A%0ASaya mau pesan:*%0A----------------------%0A${listPesanan}----------------------%0A💰 *Total Bayar: Rp ${totalAkhir.toLocaleString('id-ID')}*%0A%0AMohon diproses ya, terima kasih!`;
    window.open(`https://wa.me/6285972553371?text=${pesan}`, '_blank');
}

function inisialisasiFAQ() {
    const faqButtons = document.querySelectorAll(".faq-question");
    faqButtons.forEach(button => {
        button.addEventListener("click", () => {
            const faqItem = button.parentElement;
            faqItem.classList.toggle("active");
        });
    });
}

function munculkanPopupPromo() {
    setTimeout(() => {
        const popup = document.getElementById("popupPromo");
        if (popup) popup.style.display = "block";
    }, 2500); 
}

/* =========================================
   6. LIVE SALES NOTIFICATION
   ========================================= */
const salesData = [
    { teks: "<strong>Milaa</strong> baru saja membeli 5 Cireng Isi", loc: "Kedunguter" },
    { teks: "<strong>Adi</strong> memesan 10 Risol Mayo", loc: "Jatibarang" },
    { teks: "<strong>Ibu Sari</strong> memborong 20 Dimsum", loc: "Brebes Kota" },
    { teks: "<strong>Rehan</strong> membeli 2 Paket Hemat", loc: "Wanasari" },
    { teks: "<strong>Siti</strong> baru saja memesan 3 Cireng Pedas", loc: "Limbangan" },
    { teks: "<strong>Bpk. Budi</strong> membeli 15 Risol Sayur", loc: "Tanjung" },
    { teks: "<strong>Dewi</strong> baru saja membeli 4 Dimsum Udang", loc: "Ketanggungan" },
    { teks: "<strong>Fajar</strong> memesan 6 Cireng Ayam", loc: "Bulakamba" },
    { teks: "<strong>Nabila</strong> baru saja membeli 2 Risol Mayo", loc: "Larangan" },
    { teks: "<strong>Rian</strong> memesan 12 Cireng Mix", loc: "Banjarharjo" },
    { teks: "<strong>Putri</strong> baru saja membeli 5 Dimsum Ayam", loc: "Losari" },
    { teks: "<strong>Hendra</strong> membeli 8 Risol Melted", loc: "Kersana" },
    { teks: "<strong>Anisa</strong> baru saja memesan 3 Cireng Jando", loc: "Songgom" },
    { teks: "<strong>Gilang</strong> membeli 10 Dimsum Mix", loc: "Pagarbarang" },
    { teks: "<strong>Eka</strong> baru saja membeli 5 Risol Mayo", loc: "Sirampog" },
    { teks: "<strong>Dinda</strong> memesan 4 Paket Ngemil", loc: "Paguyangan" },
    { teks: "<strong>Fahri</strong> baru saja membeli 7 Cireng Isi", loc: "Bumiayu" },
    { teks: "<strong>Lestari</strong> memesan 15 Dimsum Frozen", loc: "Tonjong" },
    { teks: "<strong>Riko</strong> baru saja membeli 3 Risol Sayur", loc: "Salem" },
    { teks: "<strong>Yanti</strong> membeli 6 Cireng Pedas", loc: "Bantarkawung" },
    { teks: "<strong>Zaki</strong> baru saja memesan 5 Dimsum Jumbo", loc: "Padasugih" },
    { teks: "<strong>Maya</strong> membeli 10 Cireng Original", loc: "Brebes Kota" },
    { teks: "<strong>Husein</strong> baru saja membeli 4 Risol Mayo", loc: "Limbangan" },
    { teks: "<strong>Amel</strong> memesan 2 Paket Keluarga", loc: "Jatibarang" },
    { teks: "<strong>Doni</strong> baru saja membeli 8 Dimsum", loc: "Tanjung" },
    { teks: "<strong>Siska</strong> membeli 5 Cireng Ayam Suwir", loc: "Bulakamba" },
    { teks: "<strong>Baim</strong> baru saja memesan 3 Risol Mayo", loc: "Wanasari" },
    { teks: "<strong>Rara</strong> membeli 12 Dimsum Mix", loc: "Ketanggungan" },
    { teks: "<strong>Andi</strong> baru saja membeli 5 Cireng Pedas", loc: "Larangan" },
    { teks: "<strong>Tina</strong> memesan 10 Risol Sayur", loc: "Kersana" }
];

function showRandomNotif() {
    const notif = document.getElementById('sales-notification');
    const text = document.getElementById('notif-text');
    const time = document.getElementById('notif-time');
    
    if(!notif) return;
    const random = salesData[Math.floor(Math.random() * salesData.length)];
    text.innerHTML = random.teks;
    time.innerHTML = `Baru saja • 📍 ${random.loc}`;
    notif.classList.add('show');
    setTimeout(() => { notif.classList.remove('show'); }, 5000);
}

function closeNotif() {
    document.getElementById('sales-notification').classList.remove('show');
}

setInterval(showRandomNotif, 18000);
setTimeout(showRandomNotif, 8000);

/* =========================================
   7. DARK MODE TOGGLE
   ========================================= */
function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('dark-icon');
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
}

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.getElementById('dark-icon');
        if(icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
});

/* =========================================
   8. GLOBAL CLICK LISTENER
   ========================================= */
window.onclick = function(event) {
    if (event.target == modal) { tutupModal(); }
    if (event.target == document.getElementById("modalKeranjang")) { tutupModalKeranjang(); }
}


/* Tambahkan di bagian Modal (Poin 3) */
function bukaTentang() {
    const modalTentang = document.getElementById("modalTentang");
    modalTentang.style.display = "block";
}

function tutupTentang() {
    document.getElementById("modalTentang").style.display = "none";
}

/* Update Global Click Listener agar bisa tutup modal saat klik di luar kotak */
window.onclick = function(event) {
    if (event.target == document.getElementById("modalProduk")) { tutupModal(); }
    if (event.target == document.getElementById("modalKeranjang")) { tutupModalKeranjang(); }
    if (event.target == document.getElementById("modalTentang")) { tutupTentang(); }
}


function cekStatusToko() {
    const jam = new Date().getHours();
    const statusBox = document.getElementById("status-toko");
    
    if (jam >= 9 && jam < 17) {
        statusBox.style.backgroundColor = "#c6f6d5";
        statusBox.style.color = "#22543d";
        statusBox.innerHTML = "● SEDANG BUKA (Siap Kirim)";
    } else {
        statusBox.style.backgroundColor = "#fed7d7";
        statusBox.style.color = "#822727";
        statusBox.innerHTML = "● SEDANG TUTUP (Bisa PO)";
    }
}
cekStatusToko(); // Jalankan saat web dibuka

const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');
audio.volume = 0.3;
audio.play();


function salinRekening(nomor) {
    // 1. Proses Salin ke Clipboard
    navigator.clipboard.writeText(nomor);

    // 2. Mainkan Animasi Toast
    const toast = document.getElementById("custom-toast");
    toast.classList.add("show");

    // 3. Sembunyikan lagi setelah 3 detik
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}