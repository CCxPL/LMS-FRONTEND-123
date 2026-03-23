import React, { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, AlertCircle, Search, X } from 'lucide-react';
import { useFeedback } from '../../hooks/useFeedback';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import type { Feedback } from '../../types/feedback.types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const FeedbackManagement: React.FC = () => {
  const { user } = useAuth();
  const { feedbacks, getAllFeedbacks, updateFeedback, deleteFeedback, canEditFeedback, getTimeRemaining } = useFeedback();
  const { showToast } = useToast();

  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingRating, setEditingRating] = useState(0);
  const [editingCategory, setEditingCategory] = useState<'teaching' | 'behavior' | 'support' | 'other'>('teaching');
  const [isUpdating, setIsUpdating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    getAllFeedbacks();
  }, [getAllFeedbacks]);

  useEffect(() => {
    let filtered = [...feedbacks];

    if (filterCategory !== 'all') {
      filtered = filtered.filter(f => f.category === filterCategory);
    }

    if (filterRating !== 'all') {
      filtered = filtered.filter(f => f.rating === parseInt(filterRating));
    }

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, filterCategory, filterRating, searchTerm]);

  // ✅ Check if Super Admin
  const isSuperAdmin = user?.role === 'super-admin';

  // ✅ Check if can edit
  const canEdit = (feedback: Feedback) => {
    // Super Admin kabhi bhi edit kar sakte hain
    if (isSuperAdmin) return true;
    // Student sirf 48 hour ke andar edit kar sakte hain
    return canEditFeedback(feedback);
  };

  // Edit Functions
  const handleEditClick = (feedback: Feedback) => {
    if (!canEdit(feedback)) {
      showToast('✗ Cannot edit feedback after 48 hours', 'error');
      return;
    }
    setEditingId(feedback.id);
    setEditingText(feedback.feedbackText);
    setEditingRating(feedback.rating);
    setEditingCategory(feedback.category);
    setHoverRating(0);
  };

  const handleSaveEdit = async (feedbackId: string) => {
    if (!editingText.trim()) {
      showToast('✗ Feedback text cannot be empty', 'error');
      return;
    }
    if (editingRating === 0) {
      showToast('✗ Please select a rating', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      await updateFeedback(feedbackId, {
        feedbackText: editingText,
        rating: editingRating,
        category: editingCategory,
      });
      showToast('✓ Feedback updated successfully', 'success');
      setEditingId(null);
    } catch (err) {
      showToast('✗ Failed to update feedback', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
    setEditingRating(0);
    setEditingCategory('teaching');
  };

  const handleDeleteClick = (feedbackId: string) => {
    setDeleteTargetId(feedbackId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteFeedback(deleteTargetId);
      showToast('✓ Feedback deleted successfully', 'success');
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    } catch (err) {
      showToast('✗ Failed to delete feedback', 'error');
    }
  };

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const getRatingLabel = (rating: number) => {
    switch(rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage all student feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Total Feedbacks</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{feedbacks.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">Average Rating</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm font-medium">5-Star Ratings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {feedbacks.filter(f => f.rating === 5).length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Filters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All Categories</option>
              <option value="teaching">Teaching Quality</option>
              <option value="behavior">Behavior & Conduct</option>
              <option value="support">Student Support</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Feedbacks List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Feedbacks ({filteredFeedbacks.length})</h3>

        {filteredFeedbacks.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No feedbacks found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map(feedback => (
              <Card key={feedback.id} className="p-4 hover:shadow-md transition-shadow border border-gray-200">
                {editingId === feedback.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{feedback.studentName}</p>
                        <p className="text-xs text-gray-500">→ {feedback.recipientName}</p>
                      </div>
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        Editing
                      </span>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        <option value="teaching">Teaching Quality</option>
                        <option value="behavior">Behavior & Conduct</option>
                        <option value="support">Student Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setEditingRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (hoverRating || editingRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {editingRating > 0 && (
                        <p className="text-xs text-gray-600 mt-1">{getRatingLabel(editingRating)}</p>
                      )}
                    </div>

                    {/* Feedback Text */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Feedback</label>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <Button
                        onClick={() => handleSaveEdit(feedback.id)}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Time Warning - Only for non-Super Admin */}
                    {!isSuperAdmin && getTimeRemaining(feedback).hours < 12 && (
                      <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{getTimeRemaining(feedback).hours}h {getTimeRemaining(feedback).minutes}m left to edit</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{feedback.studentName}</p>
                            <p className="text-xs text-gray-500">→ {feedback.recipientName}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= feedback.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Category & Date */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            {feedback.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Feedback Text */}
                        <p className="text-sm text-gray-700 line-clamp-2">
                          "{feedback.feedbackText}"
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex gap-2">
                        {/* ✅ Edit button - Super Admin always can, others only within 48h */}
                        <button
                          onClick={() => handleEditClick(feedback)}
                          disabled={!canEdit(feedback)}
                          className="p-2 hover:bg-blue-50 rounded text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title={canEdit(feedback) ? 'Edit' : 'Cannot edit (48h passed)'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(feedback.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Time Remaining Warning - Only for non-Super Admin */}
                    {!isSuperAdmin && canEditFeedback(feedback) && getTimeRemaining(feedback).hours < 12 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{getTimeRemaining(feedback).hours}h {getTimeRemaining(feedback).minutes}m left to edit</span>
                      </div>
                    )}

                    {/* Locked Warning - Only for non-Super Admin */}
                    {!isSuperAdmin && !canEditFeedback(feedback) && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Locked - Cannot edit (48h passed)</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-900">Delete Feedback</h3>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this feedback? This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <Button fullWidth onClick={handleConfirmDelete}>
                Delete
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;