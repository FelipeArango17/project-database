USE master;
GO

-- Verificar logins a nivel servidor
SELECT name, type_desc, is_disabled
FROM sys.server_principals
WHERE name IN ('AdminLogin', 'EntrenadorLogin');
GO

USE FutData;
GO

-- Verificar usuarios en la base de datos
SELECT name, type_desc
FROM sys.database_principals
WHERE name IN ('AdminLogin', 'EntrenadorLogin');
GO

-- Verificar permisos asignados
SELECT
    pr.name AS usuario,
    obj.name AS tabla,
    pe.permission_name AS permiso,
    pe.state_desc AS estado
FROM sys.database_permissions pe
JOIN sys.database_principals pr ON pe.grantee_principal_id = pr.principal_id
JOIN sys.objects obj ON pe.major_id = obj.object_id
WHERE pr.name IN ('AdminLogin', 'EntrenadorLogin');
GO
