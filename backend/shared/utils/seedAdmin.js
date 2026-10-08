import Admin from '../../modules/admin/adminModel.js';

export const seedDefaultAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 No admins found. Creating default master administrator...');
      // Note: password will be hashed by adminModel.js pre-save middleware
      await Admin.create({
        name: 'Master Administrator',
        email: 'admin@flexigo.com',
        password: 'flexigo_root',
        role: 'SuperAdmin'
      });
      console.log('✅ Default admin created: admin@flexigo.com / flexigo_root');
    } else {
      console.log('✅ Admins already exist in database.');
    }
  } catch (error) {
    console.error('❌ Error seeding default admin:', error.message);
  }
};
