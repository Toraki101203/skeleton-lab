import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface Solution {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number; // minutes
}

const MOCK_SOLUTIONS: Solution[] = [
    { id: 'sol1', title: 'Standard Adjustment', description: 'Full body skeletal adjustment.', price: 5000, duration: 30 },
    { id: 'sol2', title: 'E-Sports Recovery', description: 'Specialized care for wrist and shoulder strain.', price: 8000, duration: 60 },
];

const SolutionBuilder = () => {
    const [solutions, setSolutions] = useState<Solution[]>(MOCK_SOLUTIONS);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Solution>>({});

    const handleAddNew = () => {
        const newId = `sol${Date.now()}`;
        setEditForm({ id: newId, title: '', description: '', price: 0, duration: 30 });
        setIsEditing(newId);
    };

    const handleEdit = (sol: Solution) => {
        setEditForm(sol);
        setIsEditing(sol.id);
    };

    const handleSave = () => {
        if (!editForm.title || !editForm.id) return;

        const newSolution = editForm as Solution;

        if (solutions.some(s => s.id === newSolution.id)) {
            setSolutions(solutions.map(s => s.id === newSolution.id ? newSolution : s));
        } else {
            setSolutions([...solutions, newSolution]);
        }

        setIsEditing(null);
        setEditForm({});
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this solution?')) {
            setSolutions(solutions.filter(s => s.id !== id));
        }
    };

    const handleCancel = () => {
        setIsEditing(null);
        setEditForm({});
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Solution Menu Builder</h1>
                <button
                    onClick={handleAddNew}
                    disabled={isEditing !== null}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Solution
                </button>
            </div>

            <div className="grid gap-4">
                {/* Edit/Create Form */}
                {isEditing && (
                    <div className="bg-white border-2 border-primary rounded-xl p-6 shadow-lg mb-4 animate-fade-in">
                        <h3 className="font-bold text-lg mb-4 text-primary">
                            {solutions.some(s => s.id === editForm.id) ? 'Edit Solution' : 'New Solution'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full border rounded-lg p-2"
                                    placeholder="e.g. Post-Game Recovery"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full border rounded-lg p-2 h-24"
                                    placeholder="Describe the treatment..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (¥)</label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    value={editForm.duration}
                                    onChange={e => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 font-bold"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                {solutions.map(sol => (
                    <div
                        key={sol.id}
                        className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center transition-opacity ${isEditing && isEditing !== sol.id ? 'opacity-50' : ''}`}
                    >
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{sol.title}</h3>
                            <p className="text-gray-600 mb-2">{sol.description}</p>
                            <div className="flex space-x-4 text-sm">
                                <span className="font-bold text-accent">¥{sol.price.toLocaleString()}</span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-500">{sol.duration} min</span>
                            </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                            <button
                                onClick={() => handleEdit(sol)}
                                disabled={isEditing !== null}
                                className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg disabled:opacity-30"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(sol.id)}
                                disabled={isEditing !== null}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {solutions.length === 0 && !isEditing && (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        No solutions added yet. Click "Add Solution" to start.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SolutionBuilder;
