import { useState, useMemo } from 'react';
import axios from 'axios';
import { DollarSign, Plus, ArrowRight, Receipt } from 'lucide-react';

const Finances=({ tripId, initialExpenses, members })=> {
  // State for holding our list of expenses
  const [expenses, setExpenses] = useState(initialExpenses || []);
  
  // State for the "Add Expense" form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(members[0]); // Defaults to the first member
  const [isLoading, setIsLoading] = useState(false);

  // --- THE MATH ENGINE ---
  // This hook automatically recalculates debts only when the 'expenses' array changes
  const { totalSpent, balances, settlements } = useMemo(() => {
    if (!expenses.length || !members.length) return { totalSpent: 0, balances: [], settlements: [] };

    let total = 0;
    const paidAmounts = {};
    
    // Start everyone at $0
    members.forEach(m => paidAmounts[m] = 0);

    // 1. Tally up who paid what
    expenses.forEach(exp => {
      if (paidAmounts[exp.paid_by] === undefined) paidAmounts[exp.paid_by] = 0;
      paidAmounts[exp.paid_by] += exp.amount;
      total += exp.amount;
    });

    // 2. Calculate Fair Share & Net Balances
    const fairShare = total / members.length;
    const currentBalances = Object.keys(paidAmounts).map(person => ({
      name: person,
      balance: paidAmounts[person] - fairShare
    }));

    // 3. Calculate Settlements (Who pays who)
    const debtors = currentBalances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = currentBalances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    const calculatedSettlements = [];
    
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const transferAmount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      calculatedSettlements.push(`${debtor.name} owes ${creditor.name} ₹${transferAmount.toFixed(2)}`);
      
      debtor.balance += transferAmount;
      creditor.balance -= transferAmount;
      
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return { totalSpent: total, balances: currentBalances, settlements: calculatedSettlements };
  }, [expenses, members]);


  // --- ADD EXPENSE FUNCTION ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    setIsLoading(true);

    try {
      // Call our Express backend to save this specific receipt
      const response = await axios.post('http://localhost:3000/api/trip/add_expense', {
        trip_id: tripId,
        title,
        amount: parseFloat(amount),
        paid_by: paidBy
      }, { withCredentials: true });

      // Update the UI with the fresh data from MongoDB
      setExpenses(response.data.expenses);
      
      // Clear the form
      setTitle('');
      setAmount('');
    } catch (error) {
      console.error("Failed to save expense", error);
      alert("Something went wrong saving the expense.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT SIDE: Add Expense Form & Ledger */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* ADD EXPENSE FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" /> Add New Expense
          </h3>
          <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="What was it for? (e.g. Dhaba Lunch)" 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <div className="flex gap-2">
              <div className="relative w-32">
                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                <input 
                  type="number" 
                  min="0" step="0.01"
                  placeholder="0.00" 
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <select 
                value={paidBy} onChange={(e) => setPaidBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white capitalize"
              >
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button 
              type="submit" disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        {/* RECENT EXPENSES LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" /> Expense Ledger
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No expenses logged yet. Add your first one above!</p>
            ) : (
              // Slice and reverse so the newest expenses show up at the very top
              expenses.slice().reverse().map((exp, i) => ( 
                <div key={`${exp.title}-${exp.amount}-${exp.paid_by}-${i}`} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-bold text-gray-900">{exp.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Paid by <span className="font-semibold text-indigo-600 capitalize">{exp.paid_by}</span></p>
                  </div>
                  <div className="font-bold text-gray-900">₹{exp.amount.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: The Math / Settlement Plan */}
      <div className="space-y-6">
        
        {/* TOTALS DISPLAY */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-md text-white">
          <p className="text-indigo-100 font-medium text-sm">Total Trip Cost</p>
          <h2 className="text-4xl font-extrabold mt-1">₹{totalSpent.toFixed(2)}</h2>
          <p className="text-indigo-200 text-sm mt-4 pt-4 border-t border-indigo-400/30">
            Fair Share per person: <span className="font-bold text-white">₹{(totalSpent / members.length || 0).toFixed(2)}</span>
          </p>
        </div>

        {/* SETTLEMENT PLAN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How to Settle Up</h3>
          
          {settlements.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <div className="bg-green-50 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-7 w-7 text-green-600" />
              </div>
              <p className="font-medium text-green-700">Everyone is settled up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement, i) => (
                <div key={`settlement-${settlement}-${i}`} className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-xl text-sm font-medium">
                  <ArrowRight className="h-4 w-4 shrink-0 text-red-500" />
                  {settlement}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export default Finances