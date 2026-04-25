-- User: EntrenadorLogin
-- SELECT: debe funcionar
SELECT * FROM Deportistas;

-- INSERT en Asistencia: debe funcionar
INSERT INTO Asistencia (id_deportista, id_entrenador, fecha, presente)
VALUES (1, 1, GETDATE(), 1);

-- INSERT en Deportistas: debe dar ERROR
INSERT INTO Deportistas (nombre, categoria)
VALUES ('Omar', 'Sub-19');

-- UPDATE en Deportistas: debe dar ERROR
UPDATE Deportistas SET nombre = 'Test' WHERE id_deportista = 1;

-- DELETE en Asistencia: debe dar ERROR
DELETE FROM Asistencia WHERE id_asistencia = 1;