/**
 * AdminModal — Legacy compatibility shim.
 * The Admin Panel has been upgraded to a full-page experience.
 * This component is kept for backward compatibility but is no longer
 * rendered; App.tsx now routes directly to <AdminPanel />.
 */
import React from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = () => {
  // The full admin panel is now rendered as a full-page view in App.tsx.
  // This modal stub is kept only so existing imports don't break.
  return null;
};

export default AdminModal;
