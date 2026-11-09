// Import Firebase Modules (Firebase v10 CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data Statis Dummy untuk Pelajaran SMP Qur'an Al Wahdah
const sampleCourses = [
    { title: "Tahfidz & Muroja'ah", teacher: "Ustadz Arham, S.Pd.I", progress: 85, icon: "fa-quran", color: "emerald" },
    { title: "Matematika VIII", teacher: "Ustadz Dzakiy, M.Pd", progress: 70, icon: "fa-calculator", color: "blue" },
    { title: "Bahasa Arab Dasar", teacher: "Ustadz Ya'la, Lc", progress: 90, icon: "fa-language", color: "amber" },
    { title: "Ilmu Pengetahuan Alam", teacher: "Ustadz Arham", progress: 65, icon: "fa-flask", color: "purple" }
];

const sampleLiveClasses = [
    { subject: "Setoran Hafalan Juz 29", time: "09:30 - 10:30 WITA", status: "Ongoing", color: "emerald" },
    { subject: "Kajian Adab Demikian", time: "13:00 - 14:00 WITA", status: "Upcoming", color: "slate" }
];

// Render Courses
function renderCourses() {
    const container = document.getElementById("courseList");
    container.innerHTML = sampleCourses.map(course => `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 course-card flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span class="w-10 h-10 bg-${course.color}-100 text-${course.color}-600 rounded-xl flex items-center justify-center font-bold">
                        <i class="fa-solid ${course.icon}"></i>
                    </span>
                    <span class="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">${course.progress}% Completed</span>
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
}

// Render Live Classes
function renderLiveClasses() {
    const container = document.getElementById("liveClassesList");
    container.innerHTML = sampleLiveClasses.map(cls => `
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
}

// Handler Form Firebase Realtime Submit
const form = document.getElementById("addHafalanForm");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const surah = document.getElementById("surahInput").value;
        const ayat = document.getElementById("ayatInput").value;

        try {
            // Menambah data ke koleksi 'hafalan' di Firestore
            await addDoc(collection(db, "hafalan"), {
                surah: surah,
                ayat: parseInt(ayat),
                timestamp: new Date()
            });
            alert(`Berhasil menyimpan setoran ${surah} (${ayat} ayat) ke Firebase!`);
            form.reset();
        } catch (error) {
            console.error("Gagal menyimpan ke Firebase:", error);
            alert("Gagal koneksi Firebase. Pastikan firebaseConfig Anda sudah terisi dengan benar!");
        }
    });
}

// Initialize Dashboard UI
document.addEventListener("DOMContentLoaded", () => {
    renderCourses();
    renderLiveClasses();
});
