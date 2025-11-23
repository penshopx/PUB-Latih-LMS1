
import { UserRole, User, Course, AnalyticsData, Certificate, StudentProgress, Comment, LeaderboardEntry } from './types';

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin Diklat',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/100/100?random=1',
    email: 'admin@pub-latih.id',
    status: 'active',
    lastLogin: new Date('2024-03-10T09:00:00')
  },
  {
    id: 'u2',
    name: 'Ir. Budi Santoso, MT',
    role: UserRole.INSTRUCTOR,
    avatar: 'https://picsum.photos/100/100?random=2',
    email: 'budi.s@pu.go.id',
    status: 'active',
    lastLogin: new Date('2024-03-11T14:30:00')
  },
  {
    id: 'u3',
    name: 'Ahmad Teknisi',
    role: UserRole.LEARNER,
    avatar: 'https://picsum.photos/100/100?random=3',
    email: 'ahmad.t@konstruksi.id',
    status: 'active',
    lastLogin: new Date('2024-03-12T10:15:00')
  },
  {
    id: 'u4',
    name: 'Siti Engineer',
    role: UserRole.LEARNER,
    avatar: 'https://picsum.photos/100/100?random=7',
    email: 'siti.eng@wika.co.id',
    status: 'active',
    lastLogin: new Date('2024-03-11T18:45:00')
  },
  {
    id: 'u5',
    name: 'Dedi Surveyor',
    role: UserRole.LEARNER,
    avatar: 'https://picsum.photos/100/100?random=8',
    email: 'dedi.s@pp.co.id',
    status: 'inactive',
    lastLogin: new Date('2024-02-28T09:00:00')
  },
  {
    id: 'u6',
    name: 'Dr. Eng. Ratna Sari',
    role: UserRole.INSTRUCTOR,
    avatar: 'https://picsum.photos/100/100?random=9',
    email: 'ratna.sari@akademisi.id',
    status: 'active',
    lastLogin: new Date('2024-03-12T08:30:00')
  }
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Ahli K3 Konstruksi (Sertifikasi)',
    description: 'Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) pada proyek konstruksi sesuai Permen PUPR No. 10/2021.',
    instructor: 'Ir. Budi Santoso, MT',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop',
    progress: 45,
    category: 'K3 & Keselamatan',
    studentsEnrolled: 1240,
    rating: 4.8,
    modules: [
      { 
        id: 'm1', 
        title: 'Pengantar SMK3 Konstruksi', 
        type: 'video', 
        duration: '15:00', 
        isCompleted: true,
        videoUrl: 'https://www.youtube.com/embed/mock1', 
        transcript: "Selamat datang di modul Pengantar SMK3. \n\n[00:30] Sektor konstruksi memiliki risiko kecelakaan kerja yang tinggi. Oleh karena itu, penerapan K3 bukan hanya kewajiban hukum, tapi kebutuhan moral.\n\n[02:00] Dasar hukum yang kita gunakan meliputi UU No. 1 Tahun 1970 dan PP No. 50 Tahun 2012 tentang Penerapan SMK3."
      },
      { 
        id: 'm2', 
        title: 'Identifikasi Bahaya & Penilaian Risiko', 
        type: 'text', 
        duration: '20:00', 
        isCompleted: false,
        textContent: "# IBPR (Identifikasi Bahaya dan Penilaian Risiko)\n\nIBPR adalah fondasi dari rencana K3L. Langkah-langkahnya adalah:\n\n1. **Identifikasi**: Menemukan potensi bahaya (fisik, kimia, ergonomi).\n2. **Penilaian**: Menghitung *Likelihood* (kemungkinan) x *Severity* (keparahan).\n3. **Pengendalian**: Hierarki pengendalian (Eliminasi, Substitusi, Engineering, Admin, APD).\n\n## Studi Kasus: Pekerjaan Galian\n- **Bahaya**: Longsor dinding tanah.\n- **Risiko**: Pekerja tertimbun (Fatality).\n- **Pengendalian**: Pemasangan turap (sheet pile) dan *sloping*."
      },
      {
        id: 'm3', 
        title: 'Uji Kompetensi Dasar K3', 
        type: 'quiz', 
        duration: '30:00', 
        isCompleted: false,
        quizData: {
          id: 'q1',
          title: 'Evaluasi Pemahaman K3 Dasar',
          questions: [
            {
              id: 'qz1',
              text: 'Hierarki pengendalian risiko yang paling efektif adalah?',
              type: 'mcq',
              options: ['Penggunaan APD', 'Administrasi', 'Eliminasi', 'Rekayasa Teknik'],
              correctAnswer: 2
            },
            {
              id: 'qz2',
              text: 'Berapa ketinggian minimal bekerja yang wajib menggunakan Full Body Harness menurut standar umum?',
              type: 'mcq',
              options: ['1.5 meter', '1.8 meter', '2.5 meter', '3.0 meter'],
              correctAnswer: 1
            }
          ]
        }
      }
    ]
  },
  {
    id: 'c2',
    title: 'Teknologi Perkerasan Jalan (Rigid & Flexible)',
    description: 'Desain, pelaksanaan, dan pemeliharaan perkerasan jalan raya menggunakan aspal (lentur) dan beton (kaku) sesuai standar Bina Marga.',
    instructor: 'Dr. Eng. Ratna Sari',
    thumbnail: 'https://images.unsplash.com/photo-1584463603296-47b781292e29?q=80&w=800&auto=format&fit=crop',
    progress: 10,
    category: 'Teknik Sipil',
    studentsEnrolled: 850,
    rating: 4.9,
    modules: [
      { 
        id: 'm4', 
        title: 'Karakteristik Material Aspal', 
        type: 'video', 
        duration: '12:30', 
        isCompleted: true,
        videoUrl: 'https://www.youtube.com/embed/mock2',
        transcript: "Halo rekan-rekan engineer. Hari ini kita membahas aspal. \n\n[01:00] Aspal adalah material visko-elastis. Sifatnya berubah terhadap suhu.\n\n[03:30] Kita akan mempelajari pengujian penetrasi, titik lembek, dan daktilitas sesuai SNI."
      },
      { 
        id: 'm5', 
        title: 'Perkerasan Kaku (Rigid Pavement)', 
        type: 'text', 
        duration: '18:00', 
        isCompleted: false,
        textContent: "# Perkerasan Kaku (Beton Semen)\n\nBerbeda dengan aspal yang memikul beban secara menyebar ke tanah dasar, perkerasan kaku memikul beban melalui aksi pelat (*slab action*).\n\n## Komponen Utama:\n1. **Pelat Beton**: Mutu tinggi (biasanya fs 45 Mpa).\n2. **Dowel (Ruji)**: Penyalur beban pada sambungan melintang.\n3. **Tie Bar**: Pengikat pada sambungan memanjang.\n4. **Subbase**: Lean Concrete (LC)."
      },
      {
        id: 'm6',
        title: 'Evaluasi Perancangan Tebal Jalan',
        type: 'quiz',
        duration: '20:00',
        isCompleted: false,
        quizData: {
          id: 'q2',
          title: 'Kuis Perkerasan Jalan',
          questions: [
            {
              id: 'qz3',
              text: 'Fungsi utama dari Dowel pada perkerasan kaku adalah?',
              type: 'mcq',
              options: ['Mencegah retak rambut', 'Menyalurkan beban antar pelat', 'Mengikat pelat agar tidak bergeser', 'Sebagai tulangan utama'],
              correctAnswer: 1
            },
            {
              id: 'qz4',
              text: 'Jenis kerusakan jalan aspal yang disebabkan oleh beban lalu lintas berlebih disebut?',
              type: 'mcq',
              options: ['Bleeding', 'Rutting (Alur)', 'Stripping', 'Ravelling'],
              correctAnswer: 1
            }
          ]
        }
      }
    ]
  },
  {
    id: 'c3',
    title: 'Manajemen Konstruksi & Estimasi Biaya (RAB)',
    description: 'Teknik penjadwalan (Kurva S), analisa harga satuan pekerjaan (AHSP), dan pengendalian biaya proyek.',
    instructor: 'Ir. Budi Santoso, MT',
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
    progress: 0,
    category: 'Manajemen Proyek',
    studentsEnrolled: 2300,
    rating: 4.7,
    modules: [
      { id: 'm7', title: 'Analisa Harga Satuan (AHSP 2024)', type: 'text', duration: '25:00', isCompleted: false, textContent: "# AHSP 2024\n\nAnalisa Harga Satuan Pekerjaan adalah kunci dalam menyusun RAB.\n\n**Rumus Dasar:**\n`Harga Satuan = (Koefisien x Harga Bahan) + (Koefisien x Upah) + (Koefisien x Alat)`" },
      { id: 'm8', title: 'Penjadwalan Kurva S', type: 'video', duration: '20:00', isCompleted: false }
    ]
  },
  {
    id: 'c4',
    title: 'Teknologi Beton Pracetak (Precast)',
    description: 'Metode konstruksi beton pracetak untuk percepatan pembangunan infrastruktur jembatan dan gedung.',
    instructor: 'Dr. Eng. Ratna Sari',
    thumbnail: 'https://images.unsplash.com/photo-1590075372533-3a62d96625cb?q=80&w=800&auto=format&fit=crop',
    progress: 0,
    category: 'Struktur',
    studentsEnrolled: 540,
    rating: 4.6,
    modules: []
  }
];

export const MOCK_STUDENT_PROGRESS: StudentProgress[] = [
  {
    id: 'sp1',
    studentId: 'u3',
    studentName: 'Ahmad Teknisi',
    studentAvatar: 'https://picsum.photos/100/100?random=3',
    courseId: 'c1',
    courseTitle: 'Ahli K3 Konstruksi (Sertifikasi)',
    progress: 33,
    completedModuleIds: ['m1'],
    lastActive: new Date('2024-03-12T10:15:00'),
    quizAverage: 0,
    status: 'Active'
  },
  {
    id: 'sp2',
    studentId: 'u4',
    studentName: 'Siti Engineer',
    studentAvatar: 'https://picsum.photos/100/100?random=7',
    courseId: 'c2',
    courseTitle: 'Teknologi Perkerasan Jalan',
    progress: 66,
    completedModuleIds: ['m4', 'm5'],
    lastActive: new Date('2024-03-11T18:45:00'),
    quizAverage: 85,
    status: 'Active'
  },
  {
    id: 'sp3',
    studentId: 'u5',
    studentName: 'Dedi Surveyor',
    studentAvatar: 'https://picsum.photos/100/100?random=8',
    courseId: 'c3',
    courseTitle: 'Manajemen Konstruksi & Estimasi Biaya',
    progress: 5,
    completedModuleIds: [],
    lastActive: new Date('2024-02-28T09:00:00'),
    quizAverage: 0,
    status: 'At Risk'
  },
  {
    id: 'sp4',
    studentId: 'u3',
    studentName: 'Ahmad Teknisi',
    studentAvatar: 'https://picsum.photos/100/100?random=3',
    courseId: 'c4',
    courseTitle: 'Teknologi Beton Pracetak',
    progress: 100,
    completedModuleIds: ['m10', 'm11'], // Mock IDs for completed history
    lastActive: new Date('2023-12-15T11:20:00'),
    quizAverage: 92,
    status: 'Completed'
  }
];

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-001',
    courseTitle: 'Pengawas Pekerjaan Jembatan',
    studentName: 'Ahmad Teknisi',
    issueDate: new Date('2023-12-15'),
    instructor: 'Ir. Budi Santoso, MT',
    serialNumber: 'PUPR-2023-8492-XJ'
  },
  {
    id: 'cert-002',
    courseTitle: 'Ahli Muda K3 Konstruksi',
    studentName: 'Ahmad Teknisi',
    issueDate: new Date('2024-02-20'),
    instructor: 'Dr. Eng. Ratna Sari',
    serialNumber: 'BNSP-2024-1102-AB'
  }
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { name: 'Sen', value: 400, uv: 2400 },
  { name: 'Sel', value: 300, uv: 1398 },
  { name: 'Rab', value: 200, uv: 9800 },
  { name: 'Kam', value: 278, uv: 3908 },
  { name: 'Jum', value: 189, uv: 4800 },
  { name: 'Sab', value: 239, uv: 3800 },
  { name: 'Min', value: 349, uv: 4300 },
];

export const COURSE_DISTRIBUTION: AnalyticsData[] = [
  { name: 'K3 Safety', value: 35 },
  { name: 'Teknik Sipil', value: 30 },
  { name: 'Manajemen', value: 20 },
  { name: 'Arsitektur', value: 15 },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'cm1',
    courseId: 'c2',
    moduleId: 'm4',
    userId: 'u4',
    userName: 'Siti Engineer',
    userAvatar: 'https://picsum.photos/100/100?random=7',
    text: 'Pak, untuk tes penetrasi aspal apakah harus suhu tepat 25 derajat Celcius?',
    timestamp: new Date(Date.now() - 3600000), 
    likes: 12
  },
  {
    id: 'cm2',
    courseId: 'c2',
    moduleId: 'm4',
    userId: 'u2',
    userName: 'Ir. Budi Santoso, MT',
    userAvatar: 'https://picsum.photos/100/100?random=2',
    text: 'Betul Bu Siti. Toleransi suhu sangat ketat karena aspal sangat sensitif termal. Gunakan waterbath yang stabil.',
    timestamp: new Date(Date.now() - 1800000), 
    likes: 8
  },
  {
    id: 'cm3',
    courseId: 'c1',
    moduleId: 'm2',
    userId: 'u5',
    userName: 'Dedi Surveyor',
    userAvatar: 'https://picsum.photos/100/100?random=8',
    text: 'Mohon share format JSA (Job Safety Analysis) yang standar PU Pak.',
    timestamp: new Date(Date.now() - 7200000), 
    likes: 5
  }
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { id: 'u4', rank: 1, name: 'Siti Engineer', avatar: 'https://picsum.photos/100/100?random=7', points: 2450, trend: 'up' },
  { id: 'u3', rank: 2, name: 'Ahmad Teknisi', avatar: 'https://picsum.photos/100/100?random=3', points: 1980, trend: 'neutral' },
  { id: 'u8', rank: 3, name: 'Rudi Arsitek', avatar: 'https://picsum.photos/100/100?random=11', points: 1850, trend: 'down' },
  { id: 'u9', rank: 4, name: 'Bambang Mandor', avatar: 'https://picsum.photos/100/100?random=12', points: 1720, trend: 'up' },
  { id: 'u5', rank: 5, name: 'Dedi Surveyor', avatar: 'https://picsum.photos/100/100?random=8', points: 1200, trend: 'neutral' },
];
