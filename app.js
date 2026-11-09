// Import Firebase Modules (Firebase v10 CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Konfigurasi Firebase Project Anda
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "smp-quran-alwahdah.firebaseapp.com",
    projectId: "smp-quran-alwahdah",
    storageBucket: "smp-quran-alwahdah.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Inisialisasi Firebase
let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch(e) {
    console.warn("Firebase belum dikonfigurasi dengan API Key valid, menggunakan Local State fallback.");
}

// Data Local State Fallback
let localSetoran = [
    { surah: "Al-Mulk", ayat: 30, date: "08/11/2026", status: "Mumtaz (Sangat Baik)" },
    { surah: "Al-Qalam", ayat: 52, date: "06/11/2026", status: "Jayyid Jiddan (Baik Sekali)" },
    { surah: "Al-Haqqah", ayat: 52, date: "04/11/2026", status: "Mumtaz (Sangat Baik)" }
];

const sampleCourses = [
    { title: "Tahfidz & Muroja'ah", teacher: "Ustadz Arham, S.Pd.I", progress: 85, icon: "fa-quran", color: "emerald", category: "Diniyah" },
    { title: "Matematika VIII", teacher: "Ustadz Dzakiy, M.Pd", progress: 70, icon: "fa-calculator", color: "blue", category: "Umum" },
    { title: "Bahasa Arab Dasar", teacher: "Ustadz Ya'la, Lc", progress: 90, icon: "fa-language", color: "amber", category: "Diniyah" },
    { title: "Ilmu Pengetahuan Alam", teacher: "Ustadz Arham, S.Pd", progress: 65, icon: "fa-flask", color: "purple", category: "Umum" },
    { title: "Bahasa Inggris VIII", teacher: "Ustadzah Nur, M.Hum", progress: 78, icon: "fa-globe", color: "sky", category: "Umum" },
    { title: "Pendidikan Agama Islam", teacher: "Ustadz Dzakiy, M.Pd", progress: 92, icon: "fa-mosque", color: "teal", category: "Diniyah" }
];

const sampleLiveClasses = [
    { subject: "Setoran Hafalan Juz 29", time: "09:30 - 10:30 WITA", status: "Ongoing", color: "emerald" },
    { subject: "Kajian Adab & Akhlak", time: "13:00 - 14:00 WITA", status: "Upcoming", color: "slate" },
    { subject: "Pendampingan Sains & Math", time: "16:00 - 17:00 WITA", status: "Upcoming", color: "slate" }
];

const sampleAssignments = [
    { title: "Ujian CBT Matematika Bab Aljabar", subject: "Matematika VIII", deadline: "10 Nov 2026", status: "Belum Dikerjakan", badge: "bg-amber-100 text-amber-700" },
    { title: "Setoran Hafalan QS. Al-Qalam 1-20", subject: "Tahfidz Al-Qur'an", deadline: "12 Nov 2026", status: "Selesai", badge: "bg-emerald-100 text-emerald-700" },
    { title: "Ringkasan Nahwu & Sharaf", subject: "Bahasa Arab", deadline: "15 Nov 2026", status: "Dalam Proses", badge: "bg-blue-100 text-blue-700" }
];

const sampleAnnouncements = [
    { title: "Pelaksanaan Ujian Tengah Semester Tahfidz", date: "8 Nov 2026", desc: "Diberitahukan kepada seluruh santri kelas 8 SMP Qur'an Al-Wahdah bahwa Ujian Ujian Tahfidz Juz 28-30 akan dimulai pekan depan." },
    { title: "Jadwal Rihlah & Muroja'ah Akbar", date: "5 Nov 2026", desc: "Kegiatan outdoor muroja'ah akan dilaksanakan di Masjid Raya Makassar pada hari Sabtu mendatang." }
];

// Switch Views
function setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn, .switch-view-btn");
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            if (!target) return;

            document.querySelectorAll(".page-view").forEach(view => view.classList.add("hidden"));
            const targetView = document.getElementById(`view-${target}`);
            if (targetView) targetView.classList.remove("hidden");

            document.querySelectorAll(".nav-btn").forEach(b => {
                if (b.getAttribute("data-target") === target) {
                    b.classList.add("active");
                } else {
                    b.classList.remove("active");
                }
            });
        });
    });
}

// Render Dashboard & Courses
function renderCourses() {
    const dashContainer = document.getElementById("dashboardCourseList");
    const allContainer = document.getElementById("allCourseList");

    const courseCardsHTML = sampleCourses.map(course => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 course-card flex flex-col justify-between shadow-sm">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span class="w-10 h-10 bg-${course.color}-100 text-${course.color}-600 rounded-xl flex items-center justify-center font-bold">
                        <i class="fa-solid ${course.icon}"></i>
                    </span>
                    <span class="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">${course.progress}% Selesai</span>
                </div>
                <h4 class="font-bold text-slate-800 text-base">${course.title}</h4>
                <p class="text-xs text-slate-400 mt-1">${course.teacher}</p>
            </div>
            
            <div class="mt-6">
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-${course.color}-500 h-full rounded-full" style="width: ${course.progress}%"></div>
                </div>
            </div>
        </div>
    `).join("");

    if (dashContainer) dashContainer.innerHTML = sampleCourses.slice(0, 4).map(course => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 course-card flex flex-col justify-between shadow-sm">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                        <i class="fa-solid ${course.icon}"></i>
                    </span>
                    <span class="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">${course.progress}% Selesai</span>
                </div>
                <h4 class="font-bold text-slate-800 text-base">${course.title}</h4>
                <p class="text-xs text-slate-400 mt-1">${course.teacher}</p>
            </div>
            
            <div class="mt-6">
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" style="width: ${course.progress}%"></div>
                </div>
            </div>
        </div>
    `).join("");

    if (allContainer) allContainer.innerHTML = courseCardsHTML;
}

// Render Live Classes
function renderLiveClasses() {
    const dashLive = document.getElementById("dashboardLiveList");
    const fullLive = document.getElementById("liveScheduleFull");

    const html = sampleLiveClasses.map(cls => `
        <div class="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
                <h5 class="font-bold text-slate-800 text-sm">${cls.subject}</h5>
                <p class="text-xs text-slate-400 mt-0.5"><i class="fa-regular fa-clock me-1"></i> ${cls.time}</p>
            </div>
            <button class="text-xs px-3 py-1.5 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition">
                Masuk
            </button>
        </div>
    `).join("");

    if (dashLive) dashLive.innerHTML = html;
    if (fullLive) fullLive.innerHTML = html;
}

// Render Tahfidz Table
function renderTahfidzTable(items) {
    const tbody = document.getElementById("tahfidzTableBody");
    if (!tbody) return;

    tbody.innerHTML = items.map(row => `
        <tr class="hover:bg-slate-50 transition">
            <td class="p-4 pl-6 font-bold text-slate-800">${row.surah}</td>
            <td class="p-4 text-slate-600">${row.ayat} Ayat</td>
            <td class="p-4 text-slate-500 text-xs">${row.date || 'Hari ini'}</td>
            <td class="p-4"><span class="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold">${row.status || 'Mumtaz'}</span></td>
        </tr>
    `).join("");
}

// Render Assignments
function renderAssignments() {
    const container = document.getElementById("assignmentList");
    if (!container) return;

    container.innerHTML = sampleAssignments.map(item => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-md ${item.badge}">${item.status}</span>
                <h4 class="font-bold text-slate-800 text-base mt-2">${item.title}</h4>
                <p class="text-xs text-slate-400 mt-1">${item.subject} • Tenggat: ${item.deadline}</p>
            </div>
            <button class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition">Buka Tugas</button>
        </div>
    `).join("");
}

// Render Announcements
function renderAnnouncements() {
    const container = document.getElementById("announcementList");
    if (!container) return;

    container.innerHTML = sampleAnnouncements.map(item => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-slate-800 text-base">${item.title}</h4>
                <span class="text-xs text-slate-400">${item.date}</span>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">${item.desc}</p>
        </div>
    `).join("");
}

// Add Hafalan Handler
async function saveHafalan(surah, ayat, status = "Mumtaz (Sangat Baik)") {
    if (db) {
        try {
            await addDoc(collection(db, "hafalan"), {
                surah,
                ayat: parseInt(ayat),
                status,
                timestamp: new Date()
            });
            alert(`Berhasil menyimpan setoran ${surah} ke Firebase Firestore!`);
        } catch(e) {
            console.error(e);
            localSetoran.unshift({ surah, ayat: parseInt(ayat), date: "Hari ini", status });
            renderTahfidzTable(localSetoran);
        }
    } else {
        localSetoran.unshift({ surah, ayat: parseInt(ayat), date: "Hari ini", status });
        renderTahfidzTable(localSetoran);
        alert(`Berhasil menyimpan setoran ${surah} (${ayat} ayat)!`);
    }
}

// Listen to Firestore Realtime Updates if available
function initFirestoreSync() {
    if (!db) {
        renderTahfidzTable(localSetoran);
        return;
    }
    try {
        const q = query(collection(db, "hafalan"), orderBy("timestamp", "desc"));
        onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                surah: doc.data().surah,
                ayat: doc.data().ayat,
                status: doc.data().status || "Mumtaz",
                date: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleDateString("id-ID") : "Hari ini"
            }));
            renderTahfidzTable(data.length ? data : localSetoran);
        }, () => {
            renderTahfidzTable(localSetoran);
        });
    } catch(e) {
        renderTahfidzTable(localSetoran);
    }
}

// DOM Ready initialization
document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    renderCourses();
    renderLiveClasses();
    renderAssignments();
    renderAnnouncements();
    initFirestoreSync();

    // Quick Hafalan Form
    const quickForm = document.getElementById("quickHafalanForm");
    if (quickForm) {
        quickForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const surah = document.getElementById("quickSurah").value;
            const ayat = document.getElementById("quickAyat").value;
            saveHafalan(surah, ayat);
            quickForm.reset();
        });
    }

    // Modal Hafalan Handlers
    const modal = document.getElementById("modalHafalan");
    const openBtn = document.getElementById("btnOpenModalHafalan");
    const closeBtn = document.getElementById("btnCloseModalHafalan");
    const modalForm = document.getElementById("modalHafalanForm");

    if (openBtn) openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    if (modalForm) {
        modalForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const surah = document.getElementById("modalSurah").value;
            const ayat = document.getElementById("modalAyat").value;
            const status = document.getElementById("modalStatus").value;
            saveHafalan(surah, ayat, status);
            modal.classList.add("hidden");
            modalForm.reset();
        });
    }
});
