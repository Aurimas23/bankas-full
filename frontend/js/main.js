
        let currentVisiblePage = 'loginPage';
        let loggedInUser = null; 
        let mockAccounts = [ 
            { id: '1', vardas: 'Jonas', pavarde: 'Jonaitis', saskaitosNumeris: 'LT121000011101001000', asmensKodas: '38001011234', balansas: 1500.50, pasoKopija: 'jonas_pass.jpg' },
            { id: '2', vardas: 'Petras', pavarde: 'Petraitis', saskaitosNumeris: 'LT121000011101001001', asmensKodas: '39002022345', balansas: 0, pasoKopija: 'petras_pass.jpg' },
            { id: '3', vardas: 'Ona', pavarde: 'Onaitė', saskaitosNumeris: 'LT121000011101001002', asmensKodas: '48503033456', balansas: 250.00, pasoKopija: 'ona_pass.jpg' }
        ];
        let nextAccountId = mockAccounts.length + 1;
        let actionToConfirm = null; 

       
        function showToast(message, type = 'success') {
            const toastContainer = document.getElementById('toast-container');
            toastContainer.textContent = message;
            toastContainer.className = `toast show ${type}`; 
            setTimeout(() => {
                toastContainer.className = 'toast'; 
            }, 3000);
        }

        
        function openModal(message, onConfirm) {
            document.getElementById('modalMessage').textContent = message;
            actionToConfirm = onConfirm;
            document.getElementById('confirmationModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('confirmationModal').style.display = 'none';
            actionToConfirm = null;
        }

        document.getElementById('modalConfirmButton').addEventListener('click', () => {
            if (actionToConfirm) {
                actionToConfirm();
            }
            closeModal();
        });

       
        function showPage(pageId) {
            document.getElementById(currentVisiblePage).classList.remove('active-page');
            document.getElementById(pageId).classList.add('active-page');
            currentVisiblePage = pageId;

        
            if (pageId === 'accountsListPage') {
                renderAccountsList();
            }
          
            if (pageId === 'newAccountPage') {
                document.getElementById('newAccountForm').reset();
                document.getElementById('saskaitosNumeris').value = '';
                document.getElementById('asmensKodasError').textContent = '';
            }
        }


        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const username = event.target.username.value;
            const password = event.target.password.value;

            if (username === 'admin' && password === 'password123') {
                loggedInUser = { username: 'admin' };
                document.getElementById('appNavigation').classList.remove('hidden');
                showPage('accountsListPage');
                showToast('Sėkmingai prisijungėte!', 'success');
            } else {
                showToast('Neteisingas vartotojo vardas arba slaptažodis.', 'error');
            }
        });

        function logout() {
            loggedInUser = null;
            document.getElementById('appNavigation').classList.add('hidden');
            showPage('loginPage');
            showToast('Sėkmingai atsijungėte.', 'success');
        }

      
        function renderAccountsList() {
            if (!loggedInUser) return; 

            const tableBody = document.getElementById('accountsTableBody');
            tableBody.innerHTML = ''; 

            const sortedAccounts = [...mockAccounts].sort((a, b) => a.pavarde.localeCompare(b.pavarde));

            if (sortedAccounts.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Sąskaitų nėra.</td></tr>';
                return;
            }

            sortedAccounts.forEach(acc => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td class="border-b border-gray-200 py-3 px-4">${acc.vardas}</td>
                    <td class="border-b border-gray-200 py-3 px-4">${acc.pavarde}</td>
                    <td class="border-b border-gray-200 py-3 px-4">${acc.saskaitosNumeris}</td>
                    <td class="border-b border-gray-200 py-3 px-4">${acc.asmensKodas}</td>
                    <td class="border-b border-gray-200 py-3 px-4 text-right">${acc.balansas.toFixed(2)}</td>
                    <td class="border-b border-gray-200 py-3 px-4 text-center">
                        <button onclick="openAddFundsPage('${acc.id}')" class="text-green-600 hover:text-green-800 text-xs font-semibold mr-2 p-1 bg-green-100 rounded">Pridėti lėšų</button>
                        <button onclick="openWithdrawFundsPage('${acc.id}')" class="text-yellow-600 hover:text-yellow-800 text-xs font-semibold mr-2 p-1 bg-yellow-100 rounded">Nuskaičiuoti lėšas</button>
                        <button onclick="confirmDeleteAccount('${acc.id}')" class="text-red-600 hover:text-red-800 text-xs font-semibold p-1 bg-red-100 rounded" ${acc.balansas > 0 ? 'disabled title="Negalima trinti sąskaitos su teigiamu likučiu"' : ''}>Trinti</button>
                    </td>
                `;
            });
        }

        document.getElementById('newAccountForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const vardas = formData.get('vardas');
            const pavarde = formData.get('pavarde');
            const asmensKodas = formData.get('asmensKodas');
            const saskaitosNumeris = formData.get('saskaitosNumeris');
          

            if (!validatePersonalCode_LT(asmensKodas)) {
                document.getElementById('asmensKodasError').textContent = 'Neteisingas asmens kodo formatas arba kontrolinis skaitmuo.';
                showToast('Neteisingas asmens kodo formatas.', 'error');
                return;
            }
            document.getElementById('asmensKodasError').textContent = '';

            if (mockAccounts.some(acc => acc.asmensKodas === asmensKodas)) {
                 document.getElementById('asmensKodasError').textContent = 'Sąskaita su tokiu asmens kodu jau egzistuoja.';
                 showToast('Sąskaita su tokiu asmens kodu jau egzistuoja.', 'error');
                 return;
            }
             document.getElementById('asmensKodasError').textContent = '';


            if (!saskaitosNumeris) {
                showToast('Prašome sugeneruoti IBAN sąskaitos numerį.', 'error');
                return;
            }

            const newAccount = {
                id: String(nextAccountId++),
                vardas,
                pavarde,
                saskaitosNumeris,
                asmensKodas,
                balansas: 0,
                pasoKopija: formData.get('pasoKopija').name || 'nera_failo.jpg' 
            };

            mockAccounts.push(newAccount);
            showToast('Nauja sąskaita sėkmingai sukurta!', 'success');
            showPage('accountsListPage');
            event.target.reset(); 
        });

        function generateAndSetIBAN() {
            const iban = generateIBAN_LT();
            document.getElementById('saskaitosNumeris').value = iban;
        }

       
        function generateIBAN_LT() {
            
            const bankCode = "12345"; 
            let accountNumber = "";
            for (let i = 0; i < 11; i++) {
                accountNumber += Math.floor(Math.random() * 10);
            }
            const countryCode = "LT";
            const bban = bankCode + accountNumber;
            
            const rearrangedIbanForCheck = bban + countryCode.split('').map(char => char.charCodeAt(0) - 55).join('') + "00";

            let numericIban = "";
            for (let i = 0; i < rearrangedIbanForCheck.length; i++) {
                const char = rearrangedIbanForCheck[i];
                if (char >= '0' && char <= '9') {
                    numericIban += char;
                } else { 
                    numericIban += (char.charCodeAt(0) - 'A'.charCodeAt(0) + 10).toString();
                }
            }
            
            const remainder = BigInt(numericIban) % 97n;
            const checkDigits = (98n - remainder).toString().padStart(2, '0');

            return `LT${checkDigits}${bankCode}${accountNumber}`;
        }

        
        function validatePersonalCode_LT(pk) {
        
            if (!pk || !/^\d{11}$/.test(pk)) return false;

          
            const firstDigit = parseInt(pk[0]);
            if (firstDigit < 1 || firstDigit > 6) return false;

            let year = parseInt(pk.substring(1, 3));
            const month = parseInt(pk.substring(3, 5));
            const day = parseInt(pk.substring(5, 7));

            if (firstDigit === 1 || firstDigit === 2) year += 1800;
            else if (firstDigit === 3 || firstDigit === 4) year += 1900;
            else if (firstDigit === 5 || firstDigit === 6) year += 2000;

            if (month < 1 || month > 12) return false;
            if (day < 1 || day > 31) return false;

            const s = pk.split('').map(Number);
            let sum1 = 0;
            const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
            for (let i = 0; i < 10; i++) {
                sum1 += s[i] * weights1[i];
            }
            let controlDigit = sum1 % 11;

            if (controlDigit === 10) {
                let sum2 = 0;
                const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
                for (let i = 0; i < 10; i++) {
                    sum2 += s[i] * weights2[i];
                }
                controlDigit = sum2 % 11;
                if (controlDigit === 10) {
                    controlDigit = 0;
                }
            }
            return controlDigit === s[10];
        }
        
        document.getElementById('asmensKodas').addEventListener('blur', function(event) {
            const pk = event.target.value;
            const errorEl = document.getElementById('asmensKodasError');
            if (pk && !validatePersonalCode_LT(pk)) {
                errorEl.textContent = 'Neteisingas asmens kodo formatas arba kontrolinis skaitmuo.';
            } else if (pk && mockAccounts.some(acc => acc.asmensKodas === pk)) {
                 errorEl.textContent = 'Sąskaita su tokiu asmens kodu jau egzistuoja.';
            }
            else {
                errorEl.textContent = '';
            }
        });

        function confirmDeleteAccount(accountId) {
            const account = mockAccounts.find(acc => acc.id === accountId);
            if (!account) {
                showToast('Sąskaita nerasta.', 'error');
                return;
            }
            if (account.balansas > 0) {
                showToast('Negalima trinti sąskaitos su teigiamu likučiu.', 'error');
                return;
            }
            openModal(`Ar tikrai norite ištrinti sąskaitą ${account.saskaitosNumeris}?`, () => deleteAccount(accountId));
        }
        
        function deleteAccount(accountId) {
            mockAccounts = mockAccounts.filter(acc => acc.id !== accountId);
            showToast('Sąskaita sėkmingai ištrinta.', 'success');
            renderAccountsList();
        }

        function openAddFundsPage(accountId) {
            const account = mockAccounts.find(acc => acc.id === accountId);
            if (!account) {
                showToast('Sąskaita nerasta.', 'error');
                return;
            }
            document.getElementById('addFundsAccountId').value = accountId;
            document.getElementById('addFundsOwnerName').textContent = `${account.vardas} ${account.pavarde}`;
            document.getElementById('addFundsBalance').textContent = account.balansas.toFixed(2);
            document.getElementById('addFundsForm').reset();
            showPage('addFundsPage');
        }

        document.getElementById('addFundsForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const accountId = document.getElementById('addFundsAccountId').value;
            const amount = parseFloat(document.getElementById('addAmount').value);

            if (isNaN(amount) || amount <= 0) {
                showToast('Įveskite teigiamą sumą.', 'error');
                return;
            }

            const account = mockAccounts.find(acc => acc.id === accountId);
            if (account) {
                account.balansas += amount;
                showToast(`Sėkmingai pridėta ${amount.toFixed(2)} EUR.`, 'success');
                showPage('accountsListPage');
            } else {
                showToast('Sąskaita nerasta.', 'error');
            }
        });

        function openWithdrawFundsPage(accountId) {
            const account = mockAccounts.find(acc => acc.id === accountId);
            if (!account) {
                showToast('Sąskaita nerasta.', 'error');
                return;
            }
            document.getElementById('withdrawFundsAccountId').value = accountId;
            document.getElementById('withdrawFundsOwnerName').textContent = `${account.vardas} ${account.pavarde}`;
            document.getElementById('withdrawFundsBalance').textContent = account.balansas.toFixed(2);
            document.getElementById('withdrawFundsForm').reset();
            showPage('withdrawFundsPage');
        }

        document.getElementById('withdrawFundsForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const accountId = document.getElementById('withdrawFundsAccountId').value;
            const amount = parseFloat(document.getElementById('withdrawAmount').value);

            if (isNaN(amount) || amount <= 0) {
                showToast('Įveskite teigiamą sumą.', 'error');
                return;
            }

            const account = mockAccounts.find(acc => acc.id === accountId);
            if (account) {
                if (account.balansas < amount) {
                    showToast('Nepakankamas sąskaitos likutis.', 'error');
                    return;
                }
                account.balansas -= amount;
                showToast(`Sėkmingai nuskaičiuota ${amount.toFixed(2)} EUR.`, 'success');
                showPage('accountsListPage');
            } else {
                showToast('Sąskaita nerasta.', 'error');
            }
        });

        if (loggedInUser) {
            document.getElementById('appNavigation').classList.remove('hidden');
            showPage('accountsListPage');
        } else {
            showPage('loginPage');
        }