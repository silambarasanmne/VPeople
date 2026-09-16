const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: String,
  rel: String,
  age: String,
  gender: String,
  edu: String,
  occ: String
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  appNo: {
    type: String,
    required: true,
    unique: true
  },
  dateSubmitted: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  fullname: {
    type: String,
    required: true
  },
  dob: String,
  age: String,
  gender: String,
  maritalStatus: String,
  aadhaar: String,
  phone: {
    type: String,
    required: true
  },
  altPhone: String,
  email: String,
  doorNo: String,
  street: String,
  area: String,
  landmark: String,
  city: String,
  district: String,
  state: String,
  pincode: String,
  residenceType: String,
  yearsAddress: String,
  totalFamily: String,
  familyMembers: [familyMemberSchema],
  qualification: String,
  course: String,
  institution: String,
  completionYear: String,
  occupation: String,
  workPlace: String,
  employmentType: String,
  monthlyIncome: String,
  otherIncome: String,
  otherEmployment: String,
  assistanceRequired: [String],
  assistanceDescription: String,
  documentsSubmitted: [String],
  declarationDate: String,
  officeAppNo: String,
  officeDateReceived: String,
  officeVerifiedBy: String,
  officeStatus: {
    type: String,
    default: 'Pending'
  },
  officeRemarks: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
