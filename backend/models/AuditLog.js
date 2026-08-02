/* BlogAuth V1 models/AuditLog.js — AuditLog Schema model */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Null indicates anonymous system events
    },
    action: {
      type: String,
      required: [true, 'Audit action is required.'],
      trim: true
    },
    targetType: {
      type: String,
      required: [true, 'Audit target model type is required.'],
      trim: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Only log creation time
  }
);

// Indexes
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
