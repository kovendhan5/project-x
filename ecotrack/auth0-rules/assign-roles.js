async function assignRoles(user, context, callback) {
  const ManagementClient = require('auth0').ManagementClient;
  const management = new ManagementClient({
    domain: auth0.domain,
    clientId: configuration.AUTH0_CLIENT_ID,
    clientSecret: configuration.AUTH0_CLIENT_SECRET,
    scope: 'read:users update:users'
  });

  try {
    // Default roles for all users
    const defaultRoles = ['user'];
    let roles = [...defaultRoles];
    
    // Check if user is admin by email domain or specific email
    if (user.email === 'admin@example.com' || user.email.endsWith('@ecotrack.com')) {
      roles.push('admin');
    }

    // Add permissions based on roles
    const permissions = {
      user: [
        'read:news',
        'read:data'
      ],
      admin: [
        'read:news',
        'write:news',
        'read:data',
        'write:data',
        'read:users',
        'update:users'
      ]
    };

    // Collect all permissions for the user's roles
    const userPermissions = roles.reduce((acc, role) => {
      return [...acc, ...(permissions[role] || [])];
    }, []);

    // Update user app metadata with roles and permissions
    await management.users.update({ id: user.user_id }, {
      app_metadata: {
        roles,
        permissions: userPermissions
      }
    });

    // Add roles and permissions to the token
    context.accessToken['https://api.ecotrack.com/roles'] = roles;
    context.accessToken['https://api.ecotrack.com/permissions'] = userPermissions;

    callback(null, user, context);
  } catch (error) {
    console.error('Error assigning roles:', error);
    callback(error);
  }
}