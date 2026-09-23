CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  signed_date TEXT NOT NULL,
  signed_at TEXT NOT NULL,
  signature_data TEXT NOT NULL,
  UNIQUE(employee_id, signed_date)
);

INSERT OR REPLACE INTO employees (id, name, sort_order) VALUES
(1,'Амаржаргал.Б',1),
(2,'Бадамцэцэг.С',2),
(3,'Батсайхан.Д',3),
(4,'Батбилэг',4),
(5,'Болормаа.Х',6),
(6,'Бадамгарав.Б',7),
(7,'Дарханцэцэг.С',8),
(8,'Дуурсүрэн.М',9),
(9,'Наранчимэг.М',10),
(10,'Уянжаргал.У',11),
(11,'Оюунчуулуун.Э',12),
(12,'Тогооч.И',13),
(13,'Тодцолмон.Ц',14),
(14,'Төмөрбөх',15),
(15,'Тунгалагтуул.Б',16),
(16,'Шүрэнцэцэг.И',17),
(17,'Цогзолмаа.Б',18),
(18,'Цогбаатар.Д',19),
(19,'Даваасүрэн',20),
(20,'Мөнх-Очир.С',21),
(21,'Хишигжаргал.А',22),
(22,'Жаргалсайхан',23),
(23,'Баярсайхан',25),
(24,'Номинцэцэг',26),
(25,'Жаргалмаа',27),
(26,'Хонгорзул',28),
(27,'Оюун сувд',29),
(28,'Пэнхэр буюу',30);
