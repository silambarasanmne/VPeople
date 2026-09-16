/**
 * V People Foundation - Beneficiary Form Application & Admin Logic
 * Connected to MongoDB via Express REST API
 */

// Global State
let familyMemberCount = 5;
let signatureCanvas, sigCtx, isDrawing = false;
let isAdminLoggedIn = false;
let cachedSubmissions = [];

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initNavigation();
  initDOBCalculator();
  initFamilyTable();
  initSignaturePad();
  initPincodeInputs();
  initLucideIcons();
  initAdminModule();
  fetchSubmissionsFromAPI();
});

// Initialize Lucide Icons
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// 0. API Integration & Local Fallback
async function fetchSubmissionsFromAPI() {
  try {
    const res = await fetch('/api/submissions.php');
    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        cachedSubmissions = result.data;
        localStorage.setItem('vpf_submissions', JSON.stringify(cachedSubmissions));
        return cachedSubmissions;
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable, using local cache:', err.message);
  }
  return getLocalSubmissionsFallback();
}

function getLocalSubmissionsFallback() {
  try {
    const data = localStorage.getItem('vpf_submissions');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function getStoredSubmissions() {
  return cachedSubmissions.length > 0 ? cachedSubmissions : getLocalSubmissionsFallback();
}

function initStorage() {
  const existing = localStorage.getItem('vpf_submissions');
  if (!existing) {
    const mockData = [
      {
        appNo: 'VPF-2026-8942',
        dateSubmitted: '2026-09-08',
        fullname: 'இரா. சரவணன் / R. Saravanan',
        dob: '1988-06-15',
        age: '38',
        gender: 'Male',
        maritalStatus: 'Married',
        aadhaar: '4829 1049 9201',
        phone: '98401 23456',
        altPhone: '94440 98765',
        email: 'saravanan.r@gmail.com',
        doorNo: '12/4',
        street: 'அண்ணா தெரு / Anna Street',
        area: 'ஜாபர்கான்பேட்டை / Jafferkhanpet',
        landmark: 'பிள்ளையார் கோவில் அருகில் / Near Temple',
        city: 'சென்னை / Chennai',
        district: 'சென்னை / Chennai',
        state: 'தமிழ்நாடு / Tamil Nadu',
        pincode: '600083',
        residenceType: 'Owned',
        yearsAddress: '12 Years',
        totalFamily: '4',
        familyMembers: [
          { name: 'சுமித்ரா / Sumithra', rel: 'மனைவி / Wife', age: '35', gender: 'Female', edu: 'B.Com', occ: 'இல்லத்தரசி / Home Maker' },
          { name: 'கவின் / Kavin', rel: 'மகன் / Son', age: '10', gender: 'Male', edu: '5th Std', occ: 'மாணவர் / Student' },
          { name: 'அபர்ணா / Aparna', rel: 'மகள் / Daughter', age: '6', gender: 'Female', edu: '1st Std', occ: 'மாணவர் / Student' },
          { name: 'இராமநாதன் / Ramanathan', rel: 'தந்தை / Father', age: '68', gender: 'Male', edu: 'SSLC', occ: 'ஓய்வு / Retired' }
        ],
        qualification: 'பட்டப்படிப்பு / Graduate (B.Sc Computer Science)',
        course: 'Computer Science',
        institution: 'மாநிலக் கல்லூரி / Presidency College',
        completionYear: '2009',
        occupation: 'தனியார் ஊழியர் / Private Employee',
        workPlace: 'கிண்டி / Guindy Industrial Estate',
        employmentType: 'Employed',
        monthlyIncome: '18,500',
        otherIncome: '2,000',
        otherEmployment: 'பகுதி நேர ஓட்டுநர்',
        assistanceRequired: ['Education Support', 'Children Education Support', 'Medical Support'],
        assistanceDescription: 'குழந்தைகளின் பள்ளி கட்டணம் மற்றும் மருத்துவ சிகிச்சைக்கு உதவி தேவைப்படுகிறது.',
        documentsSubmitted: ['Aadhaar Card', 'Bank Passbook', 'Voter ID', 'Income Certificate', 'Address Proof'],
        declarationDate: '2026-09-08',
        officeAppNo: 'VPF-2026-8942',
        officeDateReceived: '2026-09-08',
        officeVerifiedBy: 'M. Senthil Kumar',
        officeStatus: 'Approved',
        officeRemarks: 'ஆவணங்கள் சரிபார்க்கப்பட்டன. கல்வி உதவி பரிந்துரைக்கப்பட்டது.'
      }
    ];
    localStorage.setItem('vpf_submissions', JSON.stringify(mockData));
    cachedSubmissions = mockData;
  } else {
    cachedSubmissions = getLocalSubmissionsFallback();
  }
}

// 1. Navigation switching between Home Page, Form Page, and Admin Page
function initNavigation() {
  const homeTabBtn = document.getElementById('nav-home-btn');
  const formTabBtn = document.getElementById('nav-form-btn');
  const adminTabBtn = document.getElementById('nav-admin-btn');
  const heroFormBtn = document.getElementById('hero-fill-form-btn');

  const homePage = document.getElementById('home-page');
  const formPage = document.getElementById('form-page');
  const adminPage = document.getElementById('admin-page');

  function hideAllPages() {
    if (homePage) homePage.classList.add('hidden');
    if (formPage) formPage.classList.add('hidden');
    if (adminPage) adminPage.classList.add('hidden');

    [homeTabBtn, formTabBtn, adminTabBtn].forEach(btn => {
      if (btn) {
        btn.classList.remove('bg-brand-700', 'text-white');
        btn.classList.add('text-sky-100', 'hover:bg-brand-700/50');
      }
    });
  }

  function showHome() {
    hideAllPages();
    if (homePage) homePage.classList.remove('hidden');
    if (homeTabBtn) {
      homeTabBtn.classList.add('bg-brand-700', 'text-white');
      homeTabBtn.classList.remove('text-sky-100');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showForm() {
    hideAllPages();
    if (formPage) formPage.classList.remove('hidden');
    if (formTabBtn) {
      formTabBtn.classList.add('bg-brand-700', 'text-white');
      formTabBtn.classList.remove('text-sky-100');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function showAdmin() {
    hideAllPages();
    if (adminPage) adminPage.classList.remove('hidden');
    if (adminTabBtn) {
      adminTabBtn.classList.add('bg-brand-700', 'text-white');
      adminTabBtn.classList.remove('text-sky-100');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!isAdminLoggedIn) {
      document.getElementById('admin-login-card').classList.remove('hidden');
      document.getElementById('admin-dashboard-view').classList.add('hidden');
    } else {
      document.getElementById('admin-login-card').classList.add('hidden');
      document.getElementById('admin-dashboard-view').classList.remove('hidden');
      await fetchSubmissionsFromAPI();
      renderAdminTable();
    }
  }

  if (homeTabBtn) homeTabBtn.addEventListener('click', showHome);
  if (formTabBtn) formTabBtn.addEventListener('click', showForm);
  if (adminTabBtn) adminTabBtn.addEventListener('click', showAdmin);
  if (heroFormBtn) heroFormBtn.addEventListener('click', showForm);

  window.showFormPage = showForm;
  window.showHomePage = showHome;
  window.showAdminPage = showAdmin;
}

// 2. DOB Age Auto-Calculator
function initDOBCalculator() {
  const dobInput = document.getElementById('dob');
  const ageInput = document.getElementById('age');

  if (dobInput && ageInput) {
    dobInput.addEventListener('change', () => {
      const dobVal = dobInput.value;
      if (!dobVal) return;
      const birthDate = new Date(dobVal);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age >= 0) {
        ageInput.value = age;
      }
    });
  }
}

// 3. Family Table Manager
function initFamilyTable() {
  renderFamilyRows();
}

function renderFamilyRows() {
  const tbody = document.getElementById('family-members-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  for (let i = 1; i <= familyMemberCount; i++) {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-200 hover:bg-sky-50/40 transition-colors';
    tr.innerHTML = `
      <td class="px-2 py-2 text-center font-semibold text-slate-700">${i}</td>
      <td class="px-2 py-2">
        <input type="text" name="family_name_${i}" id="family_name_${i}" placeholder="பெயர் / Name"
          class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white">
      </td>
      <td class="px-2 py-2">
        <input type="text" name="family_rel_${i}" id="family_rel_${i}" placeholder="உறவு / Relation"
          class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white">
      </td>
      <td class="px-2 py-2">
        <input type="number" name="family_age_${i}" id="family_age_${i}" placeholder="வயது" min="0" max="120"
          class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-center">
      </td>
      <td class="px-2 py-2">
        <select name="family_gender_${i}" id="family_gender_${i}"
          class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white">
          <option value="">தேர்வு செய்க</option>
          <option value="Male">ஆண் / Male</option>
          <option value="Female">பெண் / Female</option>
          <option value="Other">மற்றவை</option>
        </select>
      </td>
      <td class="px-2 py-2">
        <input type="text" name="family_edu_${i}" id="family_edu_${i}" placeholder="கல்வி / Education"
          class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white">
      </td>
      <td class="px-2 py-2">
        <input type="text" name="family_occ_${i}" id="family_occ_${i}" placeholder="தொழில் / Occupation"
          class="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white">
      </td>
      <td class="px-2 py-2 text-center no-print">
        ${familyMemberCount > 1 ? `
          <button type="button" onclick="removeFamilyRow(${i})" title="அகற்று"
            class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  }

  const totalInput = document.getElementById('total_family_members');
  if (totalInput && !totalInput.value) {
    totalInput.value = familyMemberCount;
  }
}

window.addFamilyRow = function() {
  familyMemberCount++;
  renderFamilyRows();
  const totalInput = document.getElementById('total_family_members');
  if (totalInput) totalInput.value = familyMemberCount;
};

window.removeFamilyRow = function(index) {
  if (familyMemberCount <= 1) return;
  familyMemberCount--;
  renderFamilyRows();
  const totalInput = document.getElementById('total_family_members');
  if (totalInput) totalInput.value = familyMemberCount;
};

// 4. Pincode Input Formatting
function initPincodeInputs() {
  const pinInputs = document.querySelectorAll('.pincode-digit');
  pinInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length >= 1) {
        if (idx < pinInputs.length - 1) {
          pinInputs[idx + 1].focus();
        }
      }
      updateFullPincode();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        pinInputs[idx - 1].focus();
      }
    });
  });
}

function updateFullPincode() {
  const pinInputs = document.querySelectorAll('.pincode-digit');
  let pin = '';
  pinInputs.forEach(inp => pin += inp.value);
  const hiddenPin = document.getElementById('pincode_hidden');
  if (hiddenPin) hiddenPin.value = pin;
}

// 5. Signature Pad Setup
function initSignaturePad() {
  signatureCanvas = document.getElementById('signature-canvas');
  if (!signatureCanvas) return;

  sigCtx = signatureCanvas.getContext('2d');
  sigCtx.strokeStyle = '#0369a1';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';

  function getPos(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDraw(e) {
    isDrawing = true;
    const pos = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
  }

  function stopDraw() {
    isDrawing = false;
  }

  signatureCanvas.addEventListener('mousedown', startDraw);
  signatureCanvas.addEventListener('mousemove', draw);
  signatureCanvas.addEventListener('mouseup', stopDraw);
  signatureCanvas.addEventListener('mouseleave', stopDraw);

  signatureCanvas.addEventListener('touchstart', startDraw, { passive: false });
  signatureCanvas.addEventListener('touchmove', draw, { passive: false });
  signatureCanvas.addEventListener('touchend', stopDraw);
}

window.clearSignature = function() {
  if (sigCtx && signatureCanvas) {
    sigCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  }
};

// 6. Fill Sample Data for quick demo/test
window.fillSampleData = function() {
  setInputValue('fullname', 'இரா. சரவணன் / R. Saravanan');
  setInputValue('dob', '1988-06-15');
  setInputValue('age', '38');
  setRadioValue('gender', 'Male');
  setRadioValue('marital_status', 'Married');
  setInputValue('aadhaar', '4829 1049 9201');
  setInputValue('phone', '98401 23456');
  setInputValue('alt_phone', '94440 98765');
  setInputValue('email', 'saravanan.r@gmail.com');

  setInputValue('door_no', '12/4');
  setInputValue('street', 'அண்ணா தெரு / Anna Street');
  setInputValue('area', 'ஜாபர்கான்பேட்டை / Jafferkhanpet');
  setInputValue('landmark', 'பிள்ளையார் கோவில் அருகில் / Near Temple');
  setInputValue('city', 'சென்னை / Chennai');
  setInputValue('district', 'சென்னை / Chennai');
  setInputValue('state', 'தமிழ்நாடு / Tamil Nadu');
  
  const pinDigits = ['6', '0', '0', '0', '8', '3'];
  const pinInputs = document.querySelectorAll('.pincode-digit');
  pinInputs.forEach((inp, idx) => {
    if (pinDigits[idx]) inp.value = pinDigits[idx];
  });
  updateFullPincode();

  setRadioValue('type_of_residence', 'Owned');
  setInputValue('years_at_address', '12 Years');

  const sampleMembers = [
    { name: 'சுமித்ரா / Sumithra', rel: 'மனைவி / Wife', age: '35', gender: 'Female', edu: 'B.Com', occ: 'இல்லத்தரசி / Home Maker' },
    { name: 'கவின் / Kavin', rel: 'மகன் / Son', age: '10', gender: 'Male', edu: '5th Std', occ: 'மாணவர் / Student' },
    { name: 'அபர்ணா / Aparna', rel: 'மகள் / Daughter', age: '6', gender: 'Female', edu: '1st Std', occ: 'மாணவர் / Student' },
    { name: 'இராமநாதன் / Ramanathan', rel: 'தந்தை / Father', age: '68', gender: 'Male', edu: 'SSLC', occ: 'ஓய்வு / Retired' }
  ];

  sampleMembers.forEach((m, idx) => {
    const rowIdx = idx + 1;
    setInputValue(`family_name_${rowIdx}`, m.name);
    setInputValue(`family_rel_${rowIdx}`, m.rel);
    setInputValue(`family_age_${rowIdx}`, m.age);
    setSelectValue(`family_gender_${rowIdx}`, m.gender);
    setInputValue(`family_edu_${rowIdx}`, m.edu);
    setInputValue(`family_occ_${rowIdx}`, m.occ);
  });
  setInputValue('total_family_members', '4');

  setInputValue('edu_qualification', 'பட்டப்படிப்பு / Graduate (B.Sc Computer Science)');
  setInputValue('course_stream', 'Computer Science');
  setInputValue('institution_name', 'மாநிலக் கல்லூரி / Presidency College, Chennai');
  setInputValue('year_completion', '2009');

  setInputValue('occupation', 'தனியார் ஊழியர் / Private Employee');
  setInputValue('place_of_work', 'கிண்டி / Guindy Industrial Estate, Chennai');
  setRadioValue('employment_type', 'Employed');
  setInputValue('monthly_income', '18,500');
  setInputValue('other_income', '2,000');
  setInputValue('other_employment_specify', 'பகுதி நேர ஓட்டுநர் / Part-time Driver');

  setCheckboxChecked('assist_education', true);
  setCheckboxChecked('assist_children_education', true);
  setCheckboxChecked('assist_medical', true);
  setInputValue('assistance_description', 'குழந்தைகளின் பள்ளி கட்டணம் மற்றும் மருத்துவ சிகிச்சைக்கு உதவி தேவைப்படுகிறது.');

  setCheckboxChecked('doc_aadhaar', true);
  setCheckboxChecked('doc_voter', true);
  setCheckboxChecked('doc_passbook', true);
  setCheckboxChecked('doc_income', true);
  setCheckboxChecked('doc_photo', true);
  setCheckboxChecked('doc_address', true);

  const todayStr = new Date().toISOString().split('T')[0];
  setInputValue('declaration_date', todayStr);

  setInputValue('office_app_no', 'VPF-2026-8942');
  setInputValue('office_date_received', todayStr);
  setInputValue('office_verified_by', 'M. Senthil Kumar (Field Officer)');
  setRadioValue('office_status', 'Approved');
  setInputValue('office_remarks', 'ஆவணங்கள் சரிபார்க்கப்பட்டன. கல்வி உதவி பரிந்துரைக்கப்பட்டது.');

  showNotification('Demo values filled successfully! / மாதிரி விவரங்கள் நிரப்பப்பட்டன!', 'success');
};

// Helper setters
function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function setSelectValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function setRadioValue(name, val) {
  const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
  if (el) el.checked = true;
}

function setCheckboxChecked(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = checked;
}

function getRadioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : '';
}

function getCheckedBoxes(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  const values = [];
  checkboxes.forEach(c => values.push(c.value));
  return values;
}

// 7. Clear Form Data
window.clearForm = function() {
  if (confirm('படிவத்தில் உள்ள அனைத்து தகவல்களையும் அழிக்க வேண்டுமா? / Are you sure you want to clear the form?')) {
    const form = document.getElementById('beneficiary-form');
    if (form) form.reset();
    clearSignature();
    const pinInputs = document.querySelectorAll('.pincode-digit');
    pinInputs.forEach(inp => inp.value = '');
    showNotification('Form cleared / படிவம் அழிக்கப்பட்டது', 'info');
  }
};

// 8. Form Submit Handler & MongoDB Persistence
window.handleFormSubmit = async function(e) {
  e.preventDefault();

  const fullname = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (!fullname || !phone) {
    showNotification('தயவுசெய்து பெயர் மற்றும் தொலைபேசி எண்ணை உள்ளிடவும் / Please enter Name and Phone Number', 'error');
    return;
  }

  const appNo = 'VPF-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const officeAppInput = document.getElementById('office_app_no');
  if (officeAppInput && !officeAppInput.value) {
    officeAppInput.value = appNo;
  }

  const familyMembers = [];
  for (let i = 1; i <= familyMemberCount; i++) {
    const name = document.getElementById(`family_name_${i}`)?.value || '';
    if (name) {
      familyMembers.push({
        name: name,
        rel: document.getElementById(`family_rel_${i}`)?.value || '',
        age: document.getElementById(`family_age_${i}`)?.value || '',
        gender: document.getElementById(`family_gender_${i}`)?.value || '',
        edu: document.getElementById(`family_edu_${i}`)?.value || '',
        occ: document.getElementById(`family_occ_${i}`)?.value || ''
      });
    }
  }

  const newSubmission = {
    appNo: appNo,
    dateSubmitted: new Date().toISOString().split('T')[0],
    fullname: fullname,
    dob: document.getElementById('dob')?.value || '',
    age: document.getElementById('age')?.value || '',
    gender: getRadioValue('gender'),
    maritalStatus: getRadioValue('marital_status'),
    aadhaar: document.getElementById('aadhaar')?.value || '',
    phone: phone,
    altPhone: document.getElementById('alt_phone')?.value || '',
    email: document.getElementById('email')?.value || '',
    doorNo: document.getElementById('door_no')?.value || '',
    street: document.getElementById('street')?.value || '',
    area: document.getElementById('area')?.value || '',
    landmark: document.getElementById('landmark')?.value || '',
    city: document.getElementById('city')?.value || '',
    district: document.getElementById('district')?.value || '',
    state: document.getElementById('state')?.value || 'Tamil Nadu',
    pincode: document.getElementById('pincode_hidden')?.value || '600083',
    residenceType: getRadioValue('type_of_residence'),
    yearsAddress: document.getElementById('years_at_address')?.value || '',
    totalFamily: document.getElementById('total_family_members')?.value || familyMembers.length,
    familyMembers: familyMembers,
    qualification: document.getElementById('edu_qualification')?.value || '',
    course: document.getElementById('course_stream')?.value || '',
    institution: document.getElementById('institution_name')?.value || '',
    completionYear: document.getElementById('year_completion')?.value || '',
    occupation: document.getElementById('occupation')?.value || '',
    workPlace: document.getElementById('place_of_work')?.value || '',
    employmentType: getRadioValue('employment_type'),
    monthlyIncome: document.getElementById('monthly_income')?.value || '',
    otherIncome: document.getElementById('other_income')?.value || '',
    otherEmployment: document.getElementById('other_employment_specify')?.value || '',
    assistanceRequired: getCheckedBoxes('assistance[]'),
    assistanceDescription: document.getElementById('assistance_description')?.value || '',
    documentsSubmitted: getCheckedBoxes('documents[]'),
    declarationDate: document.getElementById('declaration_date')?.value || new Date().toISOString().split('T')[0],
    officeAppNo: appNo,
    officeDateReceived: new Date().toISOString().split('T')[0],
    officeVerifiedBy: document.getElementById('office_verified_by')?.value || 'Pending',
    officeStatus: getRadioValue('office_status') || 'Pending',
    officeRemarks: document.getElementById('office_remarks')?.value || ''
  };

  // POST to MongoDB REST API
  try {
    const response = await fetch('/api/submissions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubmission)
    });
    if (response.ok) {
      console.log('Saved submission to MongoDB!');
    }
  } catch (err) {
    console.warn('API save failed, saving to local cache:', err);
  }

  // Also update local cache
  cachedSubmissions.unshift(newSubmission);
  localStorage.setItem('vpf_submissions', JSON.stringify(cachedSubmissions));

  // Show Success Modal
  document.getElementById('modal-app-no').innerText = appNo;
  document.getElementById('modal-name').innerText = fullname;
  document.getElementById('modal-phone').innerText = phone;
  document.getElementById('success-modal').classList.remove('hidden');
};

window.closeSuccessModal = function() {
  document.getElementById('success-modal').classList.add('hidden');
};

// 9. Download PDF & Print Single Entry
window.downloadPDF = function() {
  showNotification('Creating PDF file... / PDF கோப்பு உருவாக்கப்படுகிறது...', 'info');
  const element = document.getElementById('form-printable-area');
  const opt = {
    margin:       [8, 8, 8, 8],
    filename:     `V_People_Beneficiary_Form_${Date.now()}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (window.html2pdf) {
    window.html2pdf().set(opt).from(element).save().then(() => {
      showNotification('PDF downloaded successfully! / PDF பதிவிறக்கப்பட்டது!', 'success');
    }).catch(err => {
      console.error(err);
      window.print();
    });
  } else {
    window.print();
  }
};

window.printForm = function() {
  window.print();
};

// ==================== 10. ADMIN MODULE & AUTHENTICATION ====================
function initAdminModule() {
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  const searchInput = document.getElementById('admin-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderAdminTable);
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('admin_username').value.trim();
  const p = document.getElementById('admin_password').value.trim();
  const errorEl = document.getElementById('admin-login-error');

  try {
    const res = await fetch('/api/admin_login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      isAdminLoggedIn = true;
      errorEl.classList.add('hidden');
      document.getElementById('admin-login-card').classList.add('hidden');
      document.getElementById('admin-dashboard-view').classList.remove('hidden');
      await fetchSubmissionsFromAPI();
      renderAdminTable();
      showNotification('Welcome Admin! / நிர்வாகி உள்நுழைந்தார்', 'success');
      return;
    }
  } catch (err) {
    // Client-side fallback check
    if (u === 'admin' && p === 'admin123') {
      isAdminLoggedIn = true;
      errorEl.classList.add('hidden');
      document.getElementById('admin-login-card').classList.add('hidden');
      document.getElementById('admin-dashboard-view').classList.remove('hidden');
      renderAdminTable();
      showNotification('Welcome Admin! / நிர்வாகி உள்நுழைந்தார்', 'success');
      return;
    }
  }

  errorEl.innerText = 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல் / Invalid Username or Password';
  errorEl.classList.remove('hidden');
}

window.handleAdminLogout = function() {
  isAdminLoggedIn = false;
  document.getElementById('admin-login-card').classList.remove('hidden');
  document.getElementById('admin-dashboard-view').classList.add('hidden');
  showNotification('Logged out / வெளியேறினீர்கள்', 'info');
};

function renderAdminTable() {
  const tbody = document.getElementById('admin-submissions-tbody');
  if (!tbody) return;

  const submissions = getStoredSubmissions();
  const searchQuery = (document.getElementById('admin-search')?.value || '').trim().toLowerCase();

  const filtered = submissions.filter(item => {
    if (!item) return false;
    const fullname = (item.fullname || '').toLowerCase();
    const appNo = (item.appNo || '').toLowerCase();
    const phone = (item.phone || '').toLowerCase();
    const district = (item.district || '').toLowerCase();
    return fullname.includes(searchQuery) ||
           appNo.includes(searchQuery) ||
           phone.includes(searchQuery) ||
           district.includes(searchQuery);
  });

  const statTotal = document.getElementById('stat-total');
  if (statTotal) statTotal.innerText = submissions.length;

  const statEdu = document.getElementById('stat-education');
  if (statEdu) statEdu.innerText = submissions.filter(s => s && Array.isArray(s.assistanceRequired) && s.assistanceRequired.some(a => (a || '').toLowerCase().includes('education'))).length;

  const statMed = document.getElementById('stat-medical');
  if (statMed) statMed.innerText = submissions.filter(s => s && Array.isArray(s.assistanceRequired) && s.assistanceRequired.some(a => (a || '').toLowerCase().includes('medical'))).length;

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-8 text-slate-500 font-medium">
          எந்த பதிவும் கண்டறியப்படவில்லை / No applications found.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach((sub, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-200 hover:bg-sky-50/50 transition-colors text-xs sm:text-sm';

    const assistList = Array.isArray(sub.assistanceRequired) ? sub.assistanceRequired : [];
    const assistBadges = assistList.map(a => `<span class="inline-block bg-sky-100 text-brand-800 text-[11px] px-1.5 py-0.5 rounded mr-1 mb-1 font-medium">${a}</span>`).join('');

    tr.innerHTML = `
      <td class="px-3 py-3 font-semibold text-center text-slate-600">${idx + 1}</td>
      <td class="px-3 py-3 font-bold text-brand-800">${sub.appNo || '-'}</td>
      <td class="px-3 py-3 font-bold text-slate-800">
        <div>${sub.fullname}</div>
        <div class="text-[11px] font-normal text-slate-500">${sub.phone} | ${sub.gender || ''}</div>
      </td>
      <td class="px-3 py-3 text-slate-600">${sub.dateSubmitted || '-'}</td>
      <td class="px-3 py-3">${assistBadges || '-'}</td>
      <td class="px-3 py-3 text-center no-print">
        <div class="flex items-center justify-center gap-1.5">
          
          <button type="button" onclick="loadSubmissionIntoForm('${sub.appNo}')" title="படிவம் பார்க்க / View Form"
            class="px-2.5 py-1 rounded bg-sky-100 hover:bg-sky-200 text-brand-800 text-xs font-bold flex items-center gap-1">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> பார்க்க
          </button>

          <button type="button" onclick="printSingleSubmission('${sub.appNo}')" title="அச்சிடுக / Print Single"
            class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i> அச்சிடு
          </button>

          <button type="button" onclick="deleteSubmission('${sub.appNo}')" title="அழி / Delete"
            class="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>

        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initLucideIcons();
}

window.loadSubmissionIntoForm = function(appNo) {
  const submissions = getStoredSubmissions();
  const sub = submissions.find(s => s.appNo === appNo);
  if (!sub) return;

  populateFormWithObject(sub);
  showFormPage();
  showNotification(`Loaded Application ${appNo}`, 'info');
};

window.printSingleSubmission = function(appNo) {
  const submissions = getStoredSubmissions();
  const sub = submissions.find(s => s.appNo === appNo);
  if (!sub) return;

  populateFormWithObject(sub);
  showFormPage();
  setTimeout(() => {
    window.print();
  }, 300);
};

function populateFormWithObject(sub) {
  setInputValue('fullname', sub.fullname || '');
  setInputValue('dob', sub.dob || '');
  setInputValue('age', sub.age || '');
  setRadioValue('gender', sub.gender || '');
  setRadioValue('marital_status', sub.maritalStatus || '');
  setInputValue('aadhaar', sub.aadhaar || '');
  setInputValue('phone', sub.phone || '');
  setInputValue('alt_phone', sub.altPhone || '');
  setInputValue('email', sub.email || '');

  setInputValue('door_no', sub.doorNo || '');
  setInputValue('street', sub.street || '');
  setInputValue('area', sub.area || '');
  setInputValue('landmark', sub.landmark || '');
  setInputValue('city', sub.city || '');
  setInputValue('district', sub.district || '');
  setInputValue('state', sub.state || 'Tamil Nadu');

  const pin = sub.pincode || '600083';
  const pinInputs = document.querySelectorAll('.pincode-digit');
  pinInputs.forEach((inp, idx) => {
    inp.value = pin[idx] || '';
  });
  updateFullPincode();

  setRadioValue('type_of_residence', sub.residenceType || '');
  setInputValue('years_at_address', sub.yearsAddress || '');

  if (sub.familyMembers && sub.familyMembers.length > 0) {
    familyMemberCount = sub.familyMembers.length;
    renderFamilyRows();
    sub.familyMembers.forEach((m, idx) => {
      const rowIdx = idx + 1;
      setInputValue(`family_name_${rowIdx}`, m.name || '');
      setInputValue(`family_rel_${rowIdx}`, m.rel || '');
      setInputValue(`family_age_${rowIdx}`, m.age || '');
      setSelectValue(`family_gender_${rowIdx}`, m.gender || '');
      setInputValue(`family_edu_${rowIdx}`, m.edu || '');
      setInputValue(`family_occ_${rowIdx}`, m.occ || '');
    });
  }
  setInputValue('total_family_members', sub.totalFamily || familyMemberCount);

  setInputValue('edu_qualification', sub.qualification || '');
  setInputValue('course_stream', sub.course || '');
  setInputValue('institution_name', sub.institution || '');
  setInputValue('year_completion', sub.completionYear || '');

  setInputValue('occupation', sub.occupation || '');
  setInputValue('place_of_work', sub.workPlace || '');
  setRadioValue('employment_type', sub.employmentType || '');
  setInputValue('monthly_income', sub.monthlyIncome || '');
  setInputValue('other_income', sub.otherIncome || '');
  setInputValue('other_employment_specify', sub.otherEmployment || '');

  const assistList = sub.assistanceRequired || [];
  ['assist_education', 'assist_senior', 'assist_medical', 'assist_children_education', 'assist_livelihood', 'assist_emergency', 'assist_widow', 'assist_other'].forEach(id => {
    setCheckboxChecked(id, false);
  });
  if (assistList.includes('Education Support')) setCheckboxChecked('assist_education', true);
  if (assistList.includes('Senior Citizen Support')) setCheckboxChecked('assist_senior', true);
  if (assistList.includes('Medical Support')) setCheckboxChecked('assist_medical', true);
  if (assistList.includes('Children Education Support')) setCheckboxChecked('assist_children_education', true);
  if (assistList.includes('Livelihood Support')) setCheckboxChecked('assist_livelihood', true);
  if (assistList.includes('Emergency Assistance')) setCheckboxChecked('assist_emergency', true);
  if (assistList.includes('Widow Support')) setCheckboxChecked('assist_widow', true);
  if (assistList.includes('Other')) setCheckboxChecked('assist_other', true);

  setInputValue('assistance_description', sub.assistanceDescription || '');

  const docList = sub.documentsSubmitted || [];
  ['doc_aadhaar', 'doc_passbook', 'doc_voter', 'doc_edu_certs', 'doc_income', 'doc_medical', 'doc_address', 'doc_photo', 'doc_community', 'doc_other'].forEach(id => {
    setCheckboxChecked(id, false);
  });
  if (docList.includes('Aadhaar Card')) setCheckboxChecked('doc_aadhaar', true);
  if (docList.includes('Bank Passbook')) setCheckboxChecked('doc_passbook', true);
  if (docList.includes('Voter ID')) setCheckboxChecked('doc_voter', true);
  if (docList.includes('Educational Certificates')) setCheckboxChecked('doc_edu_certs', true);
  if (docList.includes('Income Certificate')) setCheckboxChecked('doc_income', true);
  if (docList.includes('Medical Reports')) setCheckboxChecked('doc_medical', true);
  if (docList.includes('Address Proof')) setCheckboxChecked('doc_address', true);
  if (docList.includes('Passport Size Photo')) setCheckboxChecked('doc_photo', true);
  if (docList.includes('Community Certificate')) setCheckboxChecked('doc_community', true);
  if (docList.includes('Other')) setCheckboxChecked('doc_other', true);

  setInputValue('declaration_date', sub.declarationDate || '');
  setInputValue('office_app_no', sub.appNo || '');
  setInputValue('office_date_received', sub.officeDateReceived || '');
  setInputValue('office_verified_by', sub.officeVerifiedBy || '');
  setRadioValue('office_status', sub.officeStatus || 'Pending');
  setInputValue('office_remarks', sub.officeRemarks || '');
}

// Delete Submission from MongoDB REST API
window.deleteSubmission = async function(appNo) {
  if (confirm(`நிச்சயமாக இந்த பதிவை நீக்க வேண்டுமா? / Are you sure you want to delete ${appNo}?`)) {
    try {
      const res = await fetch(`/api/submissions.php?appNo=${appNo}`, { method: 'DELETE' });
      if (res.ok) {
        console.log(`Deleted ${appNo} from MongoDB`);
      }
    } catch (err) {
      console.warn('API delete failed, updating local cache:', err);
    }

    cachedSubmissions = cachedSubmissions.filter(s => s.appNo !== appNo);
    localStorage.setItem('vpf_submissions', JSON.stringify(cachedSubmissions));
    renderAdminTable();
    showNotification('Record deleted / பதிவு நீக்கப்பட்டது', 'info');
  }
};

window.printAllSubmissions = function() {
  const submissions = getStoredSubmissions();
  if (submissions.length === 0) {
    showNotification('No submissions to print!', 'error');
    return;
  }

  const printAllContainer = document.getElementById('print-all-records-view');
  if (!printAllContainer) return;

  printAllContainer.innerHTML = '';

  submissions.forEach((sub, idx) => {
    const card = document.createElement('div');
    card.className = 'page-break-after p-6 border-2 border-brand-800 rounded-xl mb-8 bg-white text-slate-800 text-xs';
    
    const assistText = (sub.assistanceRequired || []).join(', ') || 'N/A';
    const docText = (sub.documentsSubmitted || []).join(', ') || 'N/A';

    let familyRowsHtml = '';
    (sub.familyMembers || []).forEach((m, fIdx) => {
      familyRowsHtml += `
        <tr class="border-b border-slate-300 text-center">
          <td class="p-1">${fIdx + 1}</td>
          <td class="p-1 text-left">${m.name}</td>
          <td class="p-1">${m.rel}</td>
          <td class="p-1">${m.age}</td>
          <td class="p-1">${m.gender}</td>
          <td class="p-1">${m.edu}</td>
          <td class="p-1">${m.occ}</td>
        </tr>
      `;
    });

    card.innerHTML = `
      <div class="border-b-2 border-brand-800 pb-3 mb-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="assets/logo.png" alt="V People Logo" class="w-12 h-12 rounded-full bg-white object-contain p-0.5 border border-amber-400 shrink-0" />
          <div>
            <h2 class="text-lg font-extrabold text-brand-900">V PEOPLE FOUNDATION</h2>
            <p class="text-xs text-brand-700 font-semibold">பயனாளி விவரங்கள் சேகரிப்பு படிவம் | App No: <span class="text-brand-900 font-extrabold">${sub.appNo}</span></p>
          </div>
        </div>
        <div class="text-right text-[11px] text-slate-600">
          <p>Submitted: ${sub.dateSubmitted || '-'}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-3">
        <div class="border p-2.5 rounded bg-sky-50/50">
          <h4 class="font-bold text-brand-800 border-b pb-1 mb-1.5">1. தனிப்பட்ட விவரங்கள் / Personal Details</h4>
          <p><strong>பெயர் / Name:</strong> ${sub.fullname}</p>
          <p><strong>வயது / Age:</strong> ${sub.age} | <strong>பாலினம் / Gender:</strong> ${sub.gender || '-'}</p>
          <p><strong>தொலைபேசி / Phone:</strong> ${sub.phone} | <strong>ஆதார் / Aadhaar:</strong> ${sub.aadhaar || '-'}</p>
          <p><strong>திருமண நிலை / Marital:</strong> ${sub.maritalStatus || '-'}</p>
        </div>

        <div class="border p-2.5 rounded bg-sky-50/50">
          <h4 class="font-bold text-brand-800 border-b pb-1 mb-1.5">2. முகவரி விவரங்கள் / Address Details</h4>
          <p><strong>முகவரி / Address:</strong> ${sub.doorNo || ''} ${sub.street || ''}, ${sub.area || ''}</p>
          <p><strong>நகரம் / City:</strong> ${sub.city || ''} | <strong>மாவட்டம் / District:</strong> ${sub.district || ''}</p>
          <p><strong>அஞ்சல் குறியீடு / Pincode:</strong> ${sub.pincode || ''}</p>
          <p><strong>வசிப்பது வகை / Residence:</strong> ${sub.residenceType || '-'} (${sub.yearsAddress || '-'})</p>
        </div>
      </div>

      <div class="border p-2.5 rounded mb-3">
        <h4 class="font-bold text-brand-800 border-b pb-1 mb-1.5">3. குடும்ப உறுப்பினர்கள் / Family Details (${sub.totalFamily || (sub.familyMembers ? sub.familyMembers.length : 0)})</h4>
        <table class="w-full text-[11px] border-collapse border border-slate-300">
          <thead>
            <tr class="bg-slate-100 font-bold">
              <th class="border p-1">S.No</th>
              <th class="border p-1 text-left">Name</th>
              <th class="border p-1">Relation</th>
              <th class="border p-1">Age</th>
              <th class="border p-1">Gender</th>
              <th class="border p-1">Education</th>
              <th class="border p-1">Occupation</th>
            </tr>
          </thead>
          <tbody>
            ${familyRowsHtml || '<tr><td colspan="7" class="p-1 text-center">No family members recorded</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-3">
        <div class="border p-2.5 rounded">
          <h4 class="font-bold text-brand-800 border-b pb-1 mb-1">4. கல்வி & தொழில் / Education & Work</h4>
          <p><strong>கல்வி / Qualification:</strong> ${sub.qualification || '-'}</p>
          <p><strong>தொழில் / Work:</strong> ${sub.occupation || '-'} (${sub.employmentType || '-'})</p>
          <p><strong>மாத வருமானம் / Monthly Income:</strong> ₹${sub.monthlyIncome || '0'}</p>
        </div>

        <div class="border p-2.5 rounded">
          <h4 class="font-bold text-brand-800 border-b pb-1 mb-1">5 & 6. உதவி தேவை & ஆவணங்கள் / Assistance & Docs</h4>
          <p><strong>உதவி வகை / Assistance:</strong> ${assistText}</p>
          <p><strong>விவரம் / Description:</strong> ${sub.assistanceDescription || '-'}</p>
          <p><strong>ஆவணங்கள் / Documents:</strong> ${docText}</p>
        </div>
      </div>

      <div class="border border-slate-400 p-2 rounded bg-amber-50/50 flex justify-between items-center text-[11px]">
        <div>
          <span class="font-bold">Office Remarks:</span> ${sub.officeRemarks || 'Verified by field team.'}
        </div>
        <div class="text-right">
          <span class="font-bold">Verified By:</span> ${sub.officeVerifiedBy || 'Office Team'}
        </div>
      </div>
    `;

    printAllContainer.appendChild(card);
  });

  setTimeout(() => {
    window.print();
  }, 300);
};

window.exportCSV = function() {
  const submissions = getStoredSubmissions();
  if (submissions.length === 0) {
    showNotification('No data to export', 'error');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Application No,Submission Date,Full Name,Phone,Aadhaar,District,Pincode,Assistance Requested\n';

  submissions.forEach(s => {
    const assist = (s.assistanceRequired || []).join('; ');
    const row = `"${s.appNo}","${s.dateSubmitted || ''}","${s.fullname}","${s.phone}","${s.aadhaar || ''}","${s.district || ''}","${s.pincode || ''}","${assist}"`;
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `V_People_Submissions_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showNotification('CSV exported successfully!', 'success');
};

function showNotification(msg, type = 'info') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 transition-all transform translate-y-10 opacity-0';
    document.body.appendChild(toast);
  }

  if (type === 'success') {
    toast.className = 'fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 bg-emerald-600 text-white transition-all transform translate-y-0 opacity-100';
  } else if (type === 'error') {
    toast.className = 'fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 bg-red-600 text-white transition-all transform translate-y-0 opacity-100';
  } else {
    toast.className = 'fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 bg-brand-700 text-white transition-all transform translate-y-0 opacity-100';
  }

  toast.innerHTML = `<span>${msg}</span>`;

  setTimeout(() => {
    toast.className = toast.className.replace('translate-y-0 opacity-100', 'translate-y-10 opacity-0');
  }, 3500);
}
