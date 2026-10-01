import { db, storage, auth } from './firebase-config.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const btnLogout = document.getElementById('btn-logout');
const userInfo = document.getElementById('user-info');
const adminLayout = document.getElementById('admin-layout');

btnLogout.addEventListener('click', () => {
  signOut(auth).catch(console.error);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    btnLogout.style.display = 'inline-flex';
    userInfo.style.display = 'inline';
    userInfo.innerText = user.displayName || user.email;
    adminLayout.style.display = 'flex';
  } else {
    btnLogout.style.display = 'none';
    userInfo.style.display = 'none';
    userInfo.innerText = '';
    adminLayout.style.display = 'flex';
  }
});

// Navigation
const sidebarLinks = document.querySelectorAll('.admin-sidebar-link[data-target]');
const sections = document.querySelectorAll('.section');

sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    sidebarLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(link.getAttribute('data-target'));
    if(target) target.classList.add('active');
  });
});

// Load Dashboard Stats
async function loadStats() {
  try {
    const usersSnap = await getDocs(collection(db, "stats_users"));
    document.getElementById('stat-users').innerText = usersSnap.size;

    const adsSnap = await getDocs(collection(db, "stats_ads"));
    document.getElementById('stat-ads').innerText = adsSnap.size;

    const clicksSnap = await getDocs(collection(db, "stats_clicks"));
    document.getElementById('stat-clicks').innerText = clicksSnap.size;

    const salesSnap = await getDocs(collection(db, "stats_sales"));
    const categoryCounts = {};
    salesSnap.forEach(doc => {
      const cat = doc.data().category || 'Unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const tbody = document.getElementById('category-stats-body');
    tbody.innerHTML = '';
    for (const [cat, count] of Object.entries(categoryCounts)) {
      tbody.innerHTML += `
        <tr>
          <td>${cat}</td>
          <td>${count}</td>
        </tr>
      `;
    }

    // Draw Chart
    const ctx = document.getElementById('statsChart').getContext('2d');
    if(window.adminChart) window.adminChart.destroy(); // prevent overlap if called multiple times
    
    window.adminChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Active Users', 'Ads Watched', 'Link Clicks', 'Total Sales'],
        datasets: [{
          label: 'Platform Metrics',
          data: [usersSnap.size, adsSnap.size, clicksSnap.size, salesSnap.size],
          backgroundColor: [
            'rgba(37, 99, 235, 0.6)',
            'rgba(52, 211, 153, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(139, 92, 246, 0.6)'
          ],
          borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(52, 211, 153, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

  } catch (error) {
    console.error("Error loading stats", error);
  }
}

// Add Product
const form = document.getElementById('add-product-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true;
  btn.innerText = 'Uploading...';

  try {
    const fileInput = document.getElementById('prod-image-upload');
    const file = fileInput.files[0];
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, 'products/' + Date.now() + '_' + file.name);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    btn.innerText = 'Saving...';

    // Save to Firestore
    await addDoc(collection(db, "products"), {
      title: document.getElementById('prod-title').value,
      keyword: document.getElementById('prod-keyword').value,
      image: imageUrl,
      link: document.getElementById('prod-link').value,
      buys: 0,
      timestamp: new Date()
    });
    alert('Product added successfully!');
    form.reset();
    loadAdminProducts();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert('Error adding product');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Add Product';
  }
});

// Load All Products
async function loadAdminProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const grid = document.getElementById('admin-products-grid');
    grid.innerHTML = '';
    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="product-image">
        <div class="product-title">${item.title}</div>
        <div style="font-size: 0.9rem; margin-bottom: 1rem;">Cat: ${item.keyword}</div>
        <button class="btn btn-danger btn-delete" data-id="${docSnap.id}">Delete</button>
      `;
      grid.appendChild(card);
    });

    // Delete events
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if(confirm('Are you sure you want to delete this product?')) {
          await deleteDoc(doc(db, "products", e.target.dataset.id));
          loadAdminProducts();
        }
      });
    });
  } catch (error) {
    console.error("Error loading products", error);
  }
}

// Init
loadStats();
loadAdminProducts();
