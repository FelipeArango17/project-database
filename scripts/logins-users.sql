/*
    Este script contendra los comandos para crear los dos inicios de sesion
    en el sistema FutData. A traves de comentarios en este mismo archivo, puedes 
    redactar y especificar los nombres de cada inicio, sus claves y el proposito
    de cada uno (sus roles)
*/

-- Debemos estar en la base de datos 'master' para crear accesos al servidor
-- sys.server_principals : Libro de registro de seguridad

USE master;
GO

/*
    2 Logins a nivel de servidor
*/

-- Administrador: AdminLogin, Password: Admin.2026!
-- Privilegios: INSERT, SELECT, DELETE, UPDATE, CREATE en todas la Tablas

-- Entrenador: EntrenadorLogin, Password: Entre.2026!
-- Privilegios Aprovados: SELECT, INSERT en Asistencia 
-- Privilegios Denegados: INSERT, UPDATE, DELETE en Deportistas, DELETE en Asistencias

-- CHECK_POLICY = OFF; -> 

CREATE LOGIN AdminLogin WITH PASSWORD = 'Admin.2026!', CHECK_POLICY = OFF; 
CREATE LOGIN EntrenadorLogin WITH PASSWORD = 'Entre.2026!', CHECK_POLICY = OFF;

/*
    Creacion de tablas y usuarios (nivel base de datos)
*/

CREATE DATABASE FutData;
GO

USE FutData;
GO

CREATE TABLE Deportistas (
    id_deportista INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    categoria VARCHAR(50)
);

CREATE TABLE Entrenador (
    id_entrenador INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(50)
);

CREATE TABLE Asistencia (
    id_asistencia INT PRIMARY KEY IDENTITY(1,1),
    id_deportista INT FOREIGN KEY REFERENCES Deportistas(id_deportista),
    id_entrenador INT FOREIGN KEY REFERENCES Entrenador(id_entrenador),
    fecha DATE DEFAULT GETDATE(),
    presente BIT -- 0 no asistio , 1 asistio
);
GO

-- AdminLogin ya tiene acceso total como SA, no necesita usuario en la DB
-- Solo creamos el usuario para EntrenadorLogin 

CREATE USER EntrenadorLogin FOR LOGIN EntrenadorLogin;
GO

-- Permisos Entrenador

-- Aprobados
GRANT SELECT ON Deportistas TO EntrenadorLogin;
GRANT SELECT, INSERT ON Asistencia TO EntrenadorLogin;

-- Denegados 

DENY INSERT, UPDATE, DELETE ON Deportistas TO EntrenadorLogin;
DENY DELETE ON Asistencia TO EntrenadorLogin;


CREATE USER AdminLogin FOR LOGIN AdminLogin;
ALTER ROLE db_owner ADD MEMBER AdminLogin;
GO

-- Insertar datos para realizar pruebas

INSERT INTO Deportistas (nombre, categoria) VALUES ('Juan', 'Sub-17');
INSERT INTO Deportistas (nombre, categoria) VALUES ('Pedro', 'Sub-20');

INSERT INTO Entrenador (nombre, telefono, correo) VALUES ('Carlos López', '3001234567', 'carlos@futdata.com');
GO

-- Pruebas EntrenadorLogin

-- SELECT: debe funcionar
SELECT * FROM Deportistas; 

-- INSERT en Asistencia: debe funcionar
INSERT INTO Asistencia (id_deportista, id_entrenador, fecha, presente)
VALUES (1, 1, GETDATE(), 1);

-- INSERT en Deportistas: debe dar ERROR
INSERT INTO Deportistas (nombre, categoria)
VALUES ('Carlos', 'Sub-17');

SELECT SYSTEM_USER AS login_actual, USER AS usuario_actual;