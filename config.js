require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID,
  newsChannelId: process.env.NEWS_CHANNEL_ID,
  jobChannelId: process.env.JOB_CHANNEL_ID,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
  githubChannelId: process.env.GITHUB_CHANNEL_ID || '1520844318443700267',
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,
  autoRoleId: process.env.AUTO_ROLE_ID,

  prefixes: ['!', '.'],

  leveling: {
    xpPerMessage: 15,
    xpCooldown: 60000,
    xpMin: 5,
    xpMax: 25,
  },

  news: {
    intervalMinutes: 180,
    sources: [
      'https://dev.to/api/articles?tag=programming&per_page=3',
      'https://hn.algolia.com/api/v1/search?query=programming&tags=story&hitsPerPage=3',
    ],
  },

  jobs: {
    intervalMinutes: 180,
    sources: [
      'https://remotive.com/api/remote-jobs?category=software-dev&limit=5',
      'https://jobs.github.com/positions.json?description=developer&limit=5',
    ],
  },

  github: {
    intervalMinutes: 360,
  },

  codingBasics: {
    cpp: [
      { title: 'C++ Dasar #1 - Hello World', code: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello World!\\n";\n  return 0;\n}' },
      { title: 'C++ Dasar #2 - Variabel & Tipe Data', code: 'int angka = 10;\ndouble desimal = 3.14;\nchar huruf = \'A\';\nstring teks = "Halo";\nbool benar = true;' },
      { title: 'C++ Dasar #3 - Input Output', code: 'int umur;\ncout << "Masukkan umur: ";\ncin >> umur;\ncout << "Umurmu " << umur << " tahun";' },
      { title: 'C++ Dasar #4 - Percabangan If/Else', code: 'if (nilai >= 75) {\n  cout << "Lulus";\n} else {\n  cout << "Tidak lulus";\n}' },
      { title: 'C++ Dasar #5 - Looping (For)', code: 'for (int i = 1; i <= 10; i++) {\n  cout << i << " ";\n}' },
      { title: 'C++ Dasar #6 - Array', code: 'int arr[5] = {1, 2, 3, 4, 5};\nfor(int i = 0; i < 5; i++) {\n  cout << arr[i] << " ";\n}' },
      { title: 'C++ Dasar #7 - Function', code: 'int tambah(int a, int b) {\n  return a + b;\n}\n// panggil: int hasil = tambah(3, 4);' },
      { title: 'C++ Dasar #8 - Struct', code: 'struct Mahasiswa {\n  string nama;\n  int umur;\n  float ipk;\n};\nMahasiswa mhs = {"Budi", 20, 3.5};' },
      { title: 'C++ Dasar #9 - Pointer', code: 'int x = 10;\nint* ptr = &x;\ncout << *ptr; // output: 10' },
      { title: 'C++ Dasar #10 - OOP Class', code: 'class Mobil {\npublic:\n  string merk;\n  void klakson() {\n    cout << "Beep!\\n";\n  }\n};\nMobil m;\nm.merk = "Toyota";\nm.klakson();' },
    ],
    javascript: [
      { title: 'JS Dasar #1 - Hello World', code: 'console.log("Hello World!");' },
      { title: 'JS Dasar #2 - Variabel (let/const)', code: 'let nama = "Budi";\nconst PI = 3.14;\nvar lama = "jangan pakai var";' },
      { title: 'JS Dasar #3 - Tipe Data', code: 'let angka = 10;\nlet desimal = 3.14;\nlet teks = "Halo";\nlet bool = true;\nlet arr = [1, 2, 3];\nlet obj = {nama: "Budi", umur: 20};' },
      { title: 'JS Dasar #4 - If/Else', code: 'if (nilai >= 75) {\n  console.log("Lulus");\n} else {\n  console.log("Tidak lulus");\n}' },
      { title: 'JS Dasar #5 - Looping', code: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n\narr.forEach(item => console.log(item));' },
      { title: 'JS Dasar #6 - Array Method', code: 'let angka = [1, 2, 3, 4, 5];\nlet kali2 = angka.map(n => n * 2);\nlet genap = angka.filter(n => n % 2 === 0);\nlet jumlah = angka.reduce((a, b) => a + b, 0);' },
      { title: 'JS Dasar #7 - Function', code: 'function tambah(a, b) {\n  return a + b;\n}\n\nconst kali = (a, b) => a * b;' },
      { title: 'JS Dasar #8 - Object & Class', code: 'class Mobil {\n  constructor(merk) {\n    this.merk = merk;\n  }\n  klakson() {\n    console.log("Beep!");\n  }\n}\nconst m = new Mobil("Toyota");' },
      { title: 'JS Dasar #9 - Async/Await', code: 'async function getData() {\n  try {\n    const res = await fetch(url);\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}' },
      { title: 'JS Dasar #10 - Destructuring & Spread', code: 'const { nama, umur } = person;\nconst arr2 = [...arr1, 4, 5];\nconst obj2 = {...obj1, umur: 21};' },
    ],
  },
};
