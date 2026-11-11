const INITIAL_BALANCE = 125000;
const balanceElement = document.querySelector('#balance');
const activityList = document.querySelector('#activity-list');
const dialog = document.querySelector('#action-dialog');
const form = document.querySelector('#action-form');
const amountInput = document.querySelector('#amount');
const recipientSelect = document.querySelector('#recipient');
const recipientLabel = document.querySelector('#recipient-label');
const errorElement = document.querySelector('#form-error');
const toast = document.querySelector('#toast');
let balance = INITIAL_BALANCE;
let selectedAction = 'add';
let toastTimer;
const actions = {
  add: { title: 'Add demo funds', copy: 'Adds sample funds to the on-screen balance only.', recipient: false, sign: 1 },
  transfer: { title: 'Simulate transfer', copy: 'Subtracts a sample amount and records a simulated transfer to a sample contact.', recipient: true, sign: -1 },
  airtime: { title: 'Try airtime', copy: 'Simulates an airtime purchase. No phone number or provider is contacted.', recipient: false, sign: -1, recipientValue: 'Demo Airtime' },
  bill: { title: 'Try bill payment', copy: 'Simulates a bill payment. No biller or utility is contacted.', recipient: false, sign: -1, recipientValue: 'Demo Utilities' },
};
function formatNaira(value) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value); }
function showToast(message) { toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500); }
function openAction(actionKey) { selectedAction = actionKey; const action = actions[actionKey]; document.querySelector('#dialog-title').textContent = action.title; document.querySelector('#dialog-copy').textContent = action.copy; recipientSelect.hidden = !action.recipient; recipientLabel.hidden = !action.recipient; errorElement.hidden = true; amountInput.value = ''; dialog.showModal(); amountInput.focus(); }
document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => openAction(button.dataset.action)));
document.querySelector('#cancel-action').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
form.addEventListener('submit', (event) => {
  event.preventDefault(); const action = actions[selectedAction]; const amount = Number(amountInput.value);
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000) { errorElement.textContent = 'Enter a whole amount from ₦1 to ₦1,000,000.'; errorElement.hidden = false; return; }
  if (action.sign < 0 && amount > balance) { errorElement.textContent = 'The sample balance is too low for this simulation. Try a smaller amount or add demo funds.'; errorElement.hidden = false; return; }
  balance += action.sign * amount; balanceElement.textContent = formatNaira(balance);
  const recipient = action.recipient ? recipientSelect.value : action.recipientValue; addActivity(action.title, amount, action.sign, recipient);
  dialog.close(); form.reset(); showToast('Simulation complete — no real transaction took place.');
});
function addActivity(title, amount, sign, recipient) {
  const emptyRow = activityList.querySelector('.empty-state'); if (emptyRow) emptyRow.remove();
  const row = document.createElement('tr'); const activityCell = document.createElement('td'); const titleNode = document.createElement('strong'); titleNode.textContent = title; activityCell.append(titleNode);
  if (recipient) { const detail = document.createElement('small'); detail.className = 'table-detail'; detail.textContent = recipient; activityCell.append(detail); }
  const dateCell = document.createElement('td'); dateCell.textContent = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  const amountCell = document.createElement('td'); amountCell.className = sign > 0 ? 'amount-positive' : 'amount-negative'; amountCell.textContent = `${sign > 0 ? '+' : '−'}${formatNaira(amount)}`;
  const statusCell = document.createElement('td'); const status = document.createElement('span'); status.className = 'status-badge'; status.textContent = 'Simulated'; statusCell.append(status); row.append(activityCell, dateCell, amountCell, statusCell); activityList.prepend(row);
}
document.querySelector('#reset-demo').addEventListener('click', () => {
  balance = INITIAL_BALANCE; balanceElement.textContent = formatNaira(balance); activityList.replaceChildren(); const row = document.createElement('tr'); row.className = 'empty-state'; const cell = document.createElement('td'); cell.colSpan = 4; cell.textContent = 'No demo activity yet. Choose a sandbox action to try it.'; row.append(cell); activityList.append(row); showToast('Demo reset. No financial records were changed.');
});
