/*
  # Sample Client Data for Testing

  1. New Data
    - 50 sample clients with diverse data
    - All branches represented
    - All service types included
    - Realistic payment amounts and statuses
    - Various payment histories
    
  2. Features
    - South African names and surnames
    - Valid-format ID numbers
    - Different payment plans (6-24 months)
    - Mixed payment statuses
    - Various banks and account types
*/

-- Insert 50 sample clients with realistic South African data
INSERT INTO edsa_client_database (
  id,
  client_id_number,
  first_name,
  last_name,
  email,
  phone,
  gender,
  province,
  branch_name,
  agent_name,
  sale_date,
  sale_reference,
  service_type,
  payment_plan_months,
  bank,
  account_type,
  account_number,
  salary_date,
  tracking_date,
  nupay_reference,
  total_amount,
  monthly_payment,
  status,
  total_no_payments_made,
  total_no_missed_payments,
  created_at
) VALUES 
-- Client 1-10: Erase Debt SA branches
(gen_random_uuid(), '8501124567089', 'Nomsa', 'Mthembu', 'nomsa.mthembu@gmail.com', '0823456789', 'Female', 'KwaZulu-Natal', 'Erase Debt SA - ADMIN', 'John Smith', '2024-12-01', 'EDSA20241201-1001', 'SERVICE 1 - DRR(C & D3) - NP', 12, 'Capitec', 'Savings', '1234567890', '2025-01-25', '2025-01-27', 'NUP001', 24000.00, 2000.00, 'Active', 2, 0, '2024-12-01'),
(gen_random_uuid(), '9203158901234', 'Thabo', 'Mokoena', 'thabo.mokoena@outlook.com', '0834567891', 'Male', 'Gauteng', 'Erase Debt SA - MP', 'Sarah Johnson', '2024-11-15', 'EDSA20241115-1002', 'SERVICE 2 - D4 - BELOW 12M', 18, 'FNB', 'Cheque', '9876543210', '2025-01-15', '2025-01-17', 'NUP002', 36000.00, 2000.00, 'Active', 3, 1, '2024-11-15'),
(gen_random_uuid(), '8709251234567', 'Zanele', 'Dlamini', 'zanele.dlamini@yahoo.com', '0845678912', 'Female', 'KwaZulu-Natal', 'Erase Debt SA - SS', 'Mike Wilson', '2024-10-20', 'EDSA20241020-1003', 'SERVICE 3 - D4 - AITC', 24, 'Standard Bank', 'Savings', '5555666677', '2025-01-30', '2025-02-01', 'NUP003', 48000.00, 2000.00, 'Active', 4, 0, '2024-10-20'),
(gen_random_uuid(), '8012345678901', 'Sipho', 'Ndlovu', 'sipho.ndlovu@gmail.com', '0856789123', 'Male', 'Gauteng', 'Erase Debt SA - ADMIN', 'Lisa Thompson', '2024-09-10', 'EDSA20240910-1004', 'SERVICE 4 - NL/CR', 15, 'ABSA', 'Current', '1111222233', '2025-01-20', '2025-01-22', 'NUP004', 30000.00, 2000.00, 'Pending', 0, 0, '2024-09-10'),
(gen_random_uuid(), '9105089876543', 'Precious', 'Mahlangu', 'precious.mahlangu@webmail.co.za', '0867891234', 'Female', 'Mpumalanga', 'Erase Debt SA - MP', 'David Brown', '2024-08-25', 'EDSA20240825-1005', 'SERVICE 5 - NL ITC CLEARANCE', 12, 'Nedbank', 'Savings', '4444555566', '2025-01-10', '2025-01-12', 'NUP005', 24000.00, 2000.00, 'Active', 6, 0, '2024-08-25'),
(gen_random_uuid(), '8306127890123', 'Mandla', 'Khumalo', 'mandla.khumalo@icloud.com', '0878912345', 'Male', 'KwaZulu-Natal', 'Erase Debt SA - SS', 'Emma Davis', '2024-07-30', 'EDSA20240730-1006', 'SERVICE 6 - RN - A - NL', 18, 'TymeBank', 'Savings', '7777888899', '2025-01-28', '2025-01-30', 'NUP006', 36000.00, 2000.00, 'Cancelled', 2, 3, '2024-07-30'),
(gen_random_uuid(), '7811234567890', 'Lerato', 'Mohlala', 'lerato.mohlala@hotmail.com', '0889123456', 'Female', 'Limpopo', 'Erase Debt SA - ADMIN', 'Robert Clark', '2024-12-10', 'EDSA20241210-1007', 'SERVICE 7 - RN - OTHER/NL', 12, 'Capitec', 'Cheque', '2222333344', '2025-01-05', '2025-01-07', 'NUP007', 24000.00, 2000.00, 'Active', 1, 0, '2024-12-10'),
(gen_random_uuid(), '9007145678912', 'Bongani', 'Sithole', 'bongani.sithole@gmail.com', '0891234567', 'Male', 'KwaZulu-Natal', 'Erase Debt SA - MP', 'Jennifer White', '2024-11-05', 'EDSA20241105-1008', 'SERVICE 1 - DRR(C & D3) - P', 15, 'FNB', 'Savings', '6666777788', '2025-01-12', '2025-01-14', 'NUP008', 30000.00, 2000.00, 'Active', 2, 0, '2024-11-05'),
(gen_random_uuid(), '8508236789012', 'Nomfundo', 'Zulu', 'nomfundo.zulu@webmail.co.za', '0812345678', 'Female', 'KwaZulu-Natal', 'Erase Debt SA - SS', 'Mark Taylor', '2024-10-15', 'EDSA20241015-1009', 'SERVICE 2 - D4 - BELOW 12M', 20, 'Standard Bank', 'Current', '9999000011', '2025-01-18', '2025-01-20', 'NUP009', 40000.00, 2000.00, 'Active', 3, 1, '2024-10-15'),
(gen_random_uuid(), '8904177890123', 'Lucky', 'Makwakwa', 'lucky.makwakwa@outlook.com', '0823456780', 'Male', 'Limpopo', 'Erase Debt SA - ADMIN', 'Alice Green', '2024-09-20', 'EDSA20240920-1010', 'SERVICE 3 - D4 - AITC', 24, 'ABSA', 'Savings', '3333444455', '2025-01-22', '2025-01-24', 'NUP010', 48000.00, 2000.00, 'Pending', 0, 0, '2024-09-20'),

-- Client 11-20: SAZZ and Credifix branches
(gen_random_uuid(), '8701089012345', 'Phindi', 'Motaung', 'phindi.motaung@gmail.com', '0834567892', 'Female', 'Free State', 'SAZZ Debt Solutions', 'Peter Anderson', '2024-11-20', 'SAZZ20241120-2001', 'SERVICE 4 - NL/CR', 12, 'Capitec', 'Savings', '1010202030', '2025-01-08', '2025-01-10', 'NUP011', 24000.00, 2000.00, 'Active', 2, 0, '2024-11-20'),
(gen_random_uuid(), '9106123456789', 'Themba', 'Mashaba', 'themba.mashaba@icloud.com', '0845678903', 'Male', 'Gauteng', 'Credifix SA', 'Monica Lee', '2024-10-05', 'CRED20241005-2002', 'SERVICE 5 - NL ITC CLEARANCE', 15, 'FNB', 'Cheque', '4040505060', '2025-01-16', '2025-01-18', 'NUP012', 30000.00, 2000.00, 'Active', 4, 0, '2024-10-05'),
(gen_random_uuid(), '8309184567890', 'Busisiwe', 'Nkomo', 'busisiwe.nkomo@hotmail.com', '0856789014', 'Female', 'KwaZulu-Natal', 'SAZZ Debt Solutions', 'James Miller', '2024-12-12', 'SAZZ20241212-2003', 'SERVICE 6 - RN - A - NL', 18, 'Nedbank', 'Savings', '7070808090', '2025-01-26', '2025-01-28', 'NUP013', 36000.00, 2000.00, 'Active', 1, 0, '2024-12-12'),
(gen_random_uuid(), '8812295678901', 'Mduduzi', 'Gumede', 'mduduzi.gumede@gmail.com', '0867890125', 'Male', 'KwaZulu-Natal', 'Credifix SA', 'Rachel Adams', '2024-08-15', 'CRED20240815-2004', 'SERVICE 7 - RN - OTHER/NL', 12, 'TymeBank', 'Savings', '1212131415', '2025-01-11', '2025-01-13', 'NUP014', 24000.00, 2000.00, 'Cancelled', 3, 2, '2024-08-15'),
(gen_random_uuid(), '9004116789012', 'Ntombifuthi', 'Cele', 'ntombifuthi.cele@yahoo.com', '0878901236', 'Female', 'Eastern Cape', 'SAZZ Debt Solutions', 'Kevin Harris', '2024-11-08', 'SAZZ20241108-2005', 'SERVICE 1 - DRR(C & D3) - NP', 20, 'Standard Bank', 'Current', '5050606070', '2025-01-14', '2025-01-16', 'NUP015', 40000.00, 2000.00, 'Active', 2, 1, '2024-11-08'),
(gen_random_uuid(), '8507227890123', 'Mpho', 'Lethoba', 'mpho.lethoba@webmail.co.za', '0889012347', 'Male', 'North West', 'Credifix SA', 'Susan Moore', '2024-09-30', 'CRED20240930-2006', 'SERVICE 2 - D4 - BELOW 12M', 15, 'ABSA', 'Savings', '8080909010', '2025-01-19', '2025-01-21', 'NUP016', 30000.00, 2000.00, 'Active', 5, 0, '2024-09-30'),
(gen_random_uuid(), '9108078901234', 'Nonhlanhla', 'Dube', 'nonhlanhla.dube@outlook.com', '0801234568', 'Female', 'KwaZulu-Natal', 'SAZZ Debt Solutions', 'Brian Wilson', '2024-10-25', 'SAZZ20241025-2007', 'SERVICE 3 - D4 - AITC', 24, 'Capitec', 'Savings', '1515161718', '2025-01-23', '2025-01-25', 'NUP017', 48000.00, 2000.00, 'Active', 3, 0, '2024-10-25'),
(gen_random_uuid(), '8211119012345', 'Sizani', 'Mlambo', 'sizani.mlambo@gmail.com', '0812345679', 'Male', 'Eastern Cape', 'Credifix SA', 'Amanda Foster', '2024-12-08', 'CRED20241208-2008', 'SERVICE 4 - NL/CR', 12, 'FNB', 'Cheque', '2020212223', '2025-01-06', '2025-01-08', 'NUP018', 24000.00, 2000.00, 'Pending', 0, 0, '2024-12-08'),
(gen_random_uuid(), '8603240123456', 'Palesa', 'Molefe', 'palesa.molefe@icloud.com', '0823456790', 'Female', 'Free State', 'SAZZ Debt Solutions', 'Christopher Lee', '2024-11-12', 'SAZZ20241112-2009', 'SERVICE 5 - NL ITC CLEARANCE', 18, 'Nedbank', 'Savings', '2525262728', '2025-01-17', '2025-01-19', 'NUP019', 36000.00, 2000.00, 'Active', 2, 0, '2024-11-12'),
(gen_random_uuid(), '9007051234567', 'Sandile', 'Radebe', 'sandile.radebe@hotmail.com', '0834567801', 'Male', 'Gauteng', 'Credifix SA', 'Helen Wright', '2024-08-28', 'CRED20240828-2010', 'SERVICE 6 - RN - A - NL', 15, 'TymeBank', 'Savings', '3030313233', '2025-01-13', '2025-01-15', 'NUP020', 30000.00, 2000.00, 'Active', 6, 0, '2024-08-28'),

-- Client 11-20: SA Blacklisting Busters and Get Credit SA
(gen_random_uuid(), '8408162345678', 'Noxolo', 'Nkosi', 'noxolo.nkosi@gmail.com', '0845678912', 'Female', 'Western Cape', 'SA Blacklisting Busters', 'Tony Garcia', '2024-10-12', 'SABB20241012-3001', 'SERVICE 7 - RN - OTHER/NL', 12, 'Standard Bank', 'Current', '3535363738', '2025-01-21', '2025-01-23', 'NUP021', 24000.00, 2000.00, 'Active', 3, 0, '2024-10-12'),
(gen_random_uuid(), '9201273456789', 'Vusi', 'Mabena', 'vusi.mabena@outlook.com', '0856789023', 'Male', 'Mpumalanga', 'Get Credit SA', 'Linda Martinez', '2024-11-18', 'GCSA20241118-3002', 'SERVICE 1 - DRR(C & D3) - NP', 18, 'Capitec', 'Savings', '4040414243', '2025-01-24', '2025-01-26', 'NUP022', 36000.00, 2000.00, 'Active', 1, 0, '2024-11-18'),
(gen_random_uuid(), '8509184567890', 'Nobuhle', 'Shezi', 'nobuhle.shezi@yahoo.com', '0867890134', 'Female', 'KwaZulu-Natal', 'SA Blacklisting Busters', 'Daniel Rodriguez', '2024-09-14', 'SABB20240914-3003', 'SERVICE 2 - D4 - BELOW 12M', 20, 'FNB', 'Cheque', '4545464748', '2025-01-27', '2025-01-29', 'NUP023', 40000.00, 2000.00, 'Active', 4, 1, '2024-09-14'),
(gen_random_uuid(), '8712295678901', 'Simphiwe', 'Ngcobo', 'simphiwe.ngcobo@webmail.co.za', '0878901245', 'Male', 'Eastern Cape', 'Get Credit SA', 'Karen Thompson', '2024-12-15', 'GCSA20241215-3004', 'SERVICE 3 - D4 - AITC', 24, 'ABSA', 'Savings', '5050515253', '2025-01-29', '2025-01-31', 'NUP024', 48000.00, 2000.00, 'Pending', 0, 0, '2024-12-15'),
(gen_random_uuid(), '9011056789012', 'Nompumelelo', 'Mthethwa', 'nompumelelo.mthethwa@gmail.com', '0889012356', 'Female', 'KwaZulu-Natal', 'SA Blacklisting Busters', 'Michael Jackson', '2024-10-03', 'SABB20241003-3005', 'SERVICE 4 - NL/CR', 15, 'Nedbank', 'Savings', '5555565758', '2025-01-15', '2025-01-17', 'NUP025', 30000.00, 2000.00, 'Active', 4, 0, '2024-10-03'),
(gen_random_uuid(), '8205177890123', 'Jabulani', 'Mapisa', 'jabulani.mapisa@icloud.com', '0801234579', 'Male', 'Limpopo', 'Get Credit SA', 'Patricia Young', '2024-08-20', 'GCSA20240820-3006', 'SERVICE 5 - NL ITC CLEARANCE', 12, 'TymeBank', 'Savings', '6060616263', '2025-01-09', '2025-01-11', 'NUP026', 24000.00, 2000.00, 'Cancelled', 2, 4, '2024-08-20'),
(gen_random_uuid(), '8904088901234', 'Thandiwe', 'Mavuso', 'thandiwe.mavuso@hotmail.com', '0812345680', 'Female', 'Mpumalanga', 'SA Blacklisting Busters', 'Andrew Hall', '2024-11-25', 'SABB20241125-3007', 'SERVICE 6 - RN - A - NL', 18, 'Standard Bank', 'Current', '6565666768', '2025-01-31', '2025-02-02', 'NUP027', 36000.00, 2000.00, 'Active', 1, 0, '2024-11-25'),
(gen_random_uuid(), '8607199012345', 'Nkosana', 'Zwane', 'nkosana.zwane@gmail.com', '0823456791', 'Male', 'KwaZulu-Natal', 'Get Credit SA', 'Michelle Davis', '2024-09-08', 'GCSA20240908-3008', 'SERVICE 7 - RN - OTHER/NL', 15, 'Capitec', 'Savings', '7070717273', '2025-01-12', '2025-01-14', 'NUP028', 30000.00, 2000.00, 'Active', 5, 0, '2024-09-08'),
(gen_random_uuid(), '9208100123456', 'Siphokazi', 'Mbeki', 'siphokazi.mbeki@webmail.co.za', '0834567802', 'Female', 'Western Cape', 'SA Blacklisting Busters', 'Steven Clark', '2024-12-18', 'SABB20241218-3009', 'SERVICE 1 - DRR(C & D3) - P', 12, 'FNB', 'Cheque', '7575767778', '2025-01-04', '2025-01-06', 'NUP029', 24000.00, 2000.00, 'Pending', 0, 0, '2024-12-18'),
(gen_random_uuid(), '8510211234567', 'Mthokozisi', 'Buthelezi', 'mthokozisi.buthelezi@outlook.com', '0845678913', 'Male', 'KwaZulu-Natal', 'Get Credit SA', 'Barbara Martinez', '2024-10-28', 'GCSA20241028-3010', 'SERVICE 2 - D4 - BELOW 12M', 20, 'ABSA', 'Savings', '8080818283', '2025-01-20', '2025-01-22', 'NUP030', 40000.00, 2000.00, 'Active', 3, 1, '2024-10-28'),

-- Client 21-30: Boost My Credit Score and Shield Credit Solutions
(gen_random_uuid(), '8803122345678', 'Lindiwe', 'Hadebe', 'lindiwe.hadebe@gmail.com', '0856789024', 'Female', 'KwaZulu-Natal', 'Boost My Credit Score', 'Richard Johnson', '2024-11-02', 'BMCS20241102-4001', 'SERVICE 3 - D4 - AITC', 24, 'Nedbank', 'Current', '8585868788', '2025-01-25', '2025-01-27', 'NUP031', 48000.00, 2000.00, 'Active', 2, 0, '2024-11-02'),
(gen_random_uuid(), '9105033456789', 'Bhekani', 'Khoza', 'bhekani.khoza@icloud.com', '0867890135', 'Male', 'Gauteng', 'Shield Credit Solutions', 'Nancy Wilson', '2024-08-10', 'SCS20240810-4002', 'SERVICE 4 - NL/CR', 15, 'TymeBank', 'Savings', '9090919293', '2025-01-16', '2025-01-18', 'NUP032', 30000.00, 2000.00, 'Active', 6, 0, '2024-08-10'),
(gen_random_uuid(), '8406144567890', 'Nomsa', 'Mngomezulu', 'nomsa.mngomezulu@hotmail.com', '0878901246', 'Female', 'Mpumalanga', 'Boost My Credit Score', 'Carl Lewis', '2024-12-05', 'BMCS20241205-4003', 'SERVICE 5 - NL ITC CLEARANCE', 12, 'Standard Bank', 'Savings', '9595969798', '2025-01-07', '2025-01-09', 'NUP033', 24000.00, 2000.00, 'Active', 1, 0, '2024-12-05'),
(gen_random_uuid(), '8909255678901', 'Senzo', 'Myeni', 'senzo.myeni@gmail.com', '0889012357', 'Male', 'KwaZulu-Natal', 'Shield Credit Solutions', 'Dorothy King', '2024-09-18', 'SCS20240918-4004', 'SERVICE 6 - RN - A - NL', 18, 'Capitec', 'Cheque', '1011121314', '2025-01-28', '2025-01-30', 'NUP034', 36000.00, 2000.00, 'Cancelled', 1, 5, '2024-09-18'),
(gen_random_uuid(), '8702166789012', 'Zandile', 'Zondi', 'zandile.zondi@yahoo.com', '0801234590', 'Female', 'Western Cape', 'Boost My Credit Score', 'George Miller', '2024-11-30', 'BMCS20241130-4005', 'SERVICE 7 - RN - OTHER/NL', 15, 'FNB', 'Savings', '1111222233', '2025-01-12', '2025-01-14', 'NUP035', 30000.00, 2000.00, 'Active', 1, 0, '2024-11-30'),
(gen_random_uuid(), '9004277890123', 'Musa', 'Ndaba', 'musa.ndaba@webmail.co.za', '0812345691', 'Male', 'Limpopo', 'Shield Credit Solutions', 'Sharon Evans', '2024-10-16', 'SCS20241016-4006', 'SERVICE 1 - DRR(C & D3) - NP', 20, 'ABSA', 'Current', '1212232425', '2025-01-18', '2025-01-20', 'NUP036', 40000.00, 2000.00, 'Active', 3, 0, '2024-10-16'),
(gen_random_uuid(), '8508088901234', 'Thokozile', 'Goba', 'thokozile.goba@outlook.com', '0823456792', 'Female', 'Free State', 'Boost My Credit Score', 'Paul Anderson', '2024-08-05', 'BMCS20240805-4007', 'SERVICE 2 - D4 - BELOW 12M', 12, 'Nedbank', 'Savings', '1313242526', '2025-01-10', '2025-01-12', 'NUP037', 24000.00, 2000.00, 'Active', 7, 0, '2024-08-05'),

-- Client 31-40: National Credit Solutions and Credit Score Experts
(gen_random_uuid(), '8811199012345', 'Sibusiso', 'Madondo', 'sibusiso.madondo@gmail.com', '0834567803', 'Male', 'KwaZulu-Natal', 'National Credit Solutions', 'Maria Gonzalez', '2024-12-20', 'NCS20241220-5001', 'SERVICE 3 - D4 - AITC', 24, 'TymeBank', 'Savings', '1414252627', '2025-01-26', '2025-01-28', 'NUP038', 48000.00, 2000.00, 'Pending', 0, 0, '2024-12-20'),
(gen_random_uuid(), '9009100123456', 'Enhle', 'Zungu', 'enhle.zungu@icloud.com', '0845678914', 'Female', 'Gauteng', 'South African Credit Score Experts - AA', 'Joseph Brown', '2024-10-07', 'SACSE20241007-5002', 'SERVICE 4 - NL/CR', 15, 'Standard Bank', 'Cheque', '1515272829', '2025-01-14', '2025-01-16', 'NUP039', 30000.00, 2000.00, 'Active', 4, 0, '2024-10-07'),
(gen_random_uuid(), '8712011234567', 'Lungile', 'Shabalala', 'lungile.shabalala@hotmail.com', '0856789025', 'Male', 'Eastern Cape', 'National Credit Solutions', 'Jennifer White', '2024-09-25', 'NCS20240925-5003', 'SERVICE 5 - NL ITC CLEARANCE', 18, 'Capitec', 'Savings', '1616282930', '2025-01-22', '2025-01-24', 'NUP040', 36000.00, 2000.00, 'Active', 3, 1, '2024-09-25'),
(gen_random_uuid(), '8605122345678', 'Nomzamo', 'Tshabalala', 'nomzamo.tshabalala@gmail.com', '0867890136', 'Female', 'North West', 'South African Credit Score Experts - QAA', 'Robert Davis', '2024-12-03', 'SACSE20241203-5004', 'SERVICE 6 - RN - A - NL', 12, 'FNB', 'Savings', '1717293031', '2025-01-08', '2025-01-10', 'NUP041', 24000.00, 2000.00, 'Active', 1, 0, '2024-12-03'),
(gen_random_uuid(), '9106233456789', 'Sthembiso', 'Majola', 'sthembiso.majola@webmail.co.za', '0878901247', 'Male', 'Free State', 'National Credit Solutions', 'Angela Moore', '2024-08-18', 'NCS20240818-5005', 'SERVICE 7 - RN - OTHER/NL', 15, 'ABSA', 'Current', '1818303132', '2025-01-11', '2025-01-13', 'NUP042', 30000.00, 2000.00, 'Active', 6, 0, '2024-08-18'),
(gen_random_uuid(), '8508034567890', 'Bongiwe', 'Mahlangu', 'bongiwe.mahlangu@outlook.com', '0889012358', 'Female', 'Mpumalanga', 'South African Credit Score Experts - AA', 'David Wilson', '2024-11-14', 'SACSE20241114-5006', 'SERVICE 1 - DRR(C & D3) - P', 20, 'Nedbank', 'Savings', '1919313233', '2025-01-17', '2025-01-19', 'NUP043', 40000.00, 2000.00, 'Active', 2, 0, '2024-11-14'),
(gen_random_uuid(), '8711145678901', 'Sibongile', 'Ngema', 'sibongile.ngema@yahoo.com', '0801234591', 'Female', 'Western Cape', 'National Credit Solutions', 'Thomas Garcia', '2024-09-12', 'NCS20240912-5007', 'SERVICE 2 - D4 - BELOW 12M', 12, 'TymeBank', 'Cheque', '2020323334', '2025-01-13', '2025-01-15', 'NUP044', 24000.00, 2000.00, 'Active', 5, 0, '2024-09-12'),
(gen_random_uuid(), '9203255678901', 'Nkululeko', 'Mthembu', 'nkululeko.mthembu@gmail.com', '0812345692', 'Male', 'KwaZulu-Natal', 'South African Credit Score Experts - QAA', 'Lisa Anderson', '2024-12-28', 'SACSE20241228-5008', 'SERVICE 3 - D4 - AITC', 24, 'Standard Bank', 'Savings', '2121333435', '2025-01-30', '2025-02-01', 'NUP045', 48000.00, 2000.00, 'Pending', 0, 0, '2024-12-28'),
(gen_random_uuid(), '8409166789012', 'Khanyisile', 'Zondo', 'khanyisile.zondo@icloud.com', '0823456793', 'Female', 'Eastern Cape', 'National Credit Solutions', 'Kevin Johnson', '2024-10-21', 'NCS20241021-5009', 'SERVICE 4 - NL/CR', 18, 'Capitec', 'Savings', '2222343536', '2025-01-19', '2025-01-21', 'NUP046', 36000.00, 2000.00, 'Active', 3, 0, '2024-10-21'),
(gen_random_uuid(), '8906277890123', 'Ayanda', 'Mhlongo', 'ayanda.mhlongo@hotmail.com', '0834567804', 'Male', 'Gauteng', 'South African Credit Score Experts - AA', 'Rebecca Lewis', '2024-08-30', 'SACSE20240830-5010', 'SERVICE 5 - NL ITC CLEARANCE', 15, 'FNB', 'Current', '2323353637', '2025-01-15', '2025-01-17', 'NUP047', 30000.00, 2000.00, 'Active', 6, 0, '2024-08-30'),

-- Client 41-50: Clean Slate Solutions and remaining branches
(gen_random_uuid(), '8504188901234', 'Noluthando', 'Mchunu', 'noluthando.mchunu@gmail.com', '0845678915', 'Female', 'KwaZulu-Natal', 'Clean Slate Solutions - RSJ', 'Christopher Taylor', '2024-11-06', 'CSS20241106-6001', 'SERVICE 6 - RN - A - NL', 12, 'ABSA', 'Savings', '2424363738', '2025-01-21', '2025-01-23', 'NUP048', 24000.00, 2000.00, 'Active', 2, 0, '2024-11-06'),
(gen_random_uuid(), '9107099012345', 'Mandla', 'Vilakazi', 'mandla.vilakazi@webmail.co.za', '0856789026', 'Male', 'Mpumalanga', 'Clean Slate Solutions - MSJ', 'Sandra Williams', '2024-09-16', 'CSS20240916-6002', 'SERVICE 7 - RN - OTHER/NL', 18, 'Nedbank', 'Cheque', '2525373839', '2025-01-24', '2025-01-26', 'NUP049', 36000.00, 2000.00, 'Active', 4, 0, '2024-09-16'),
(gen_random_uuid(), '8208200123456', 'Sindiswa', 'Khanyile', 'sindiswa.khanyile@outlook.com', '0867890137', 'Female', 'Western Cape', 'Increase My Credit Score', 'Matthew Brown', '2024-12-11', 'IMCS20241211-6003', 'SERVICE 1 - DRR(C & D3) - NP', 15, 'TymeBank', 'Savings', '2626383940', '2025-01-16', '2025-01-18', 'NUP050', 30000.00, 2000.00, 'Pending', 0, 0, '2024-12-11'),
(gen_random_uuid(), '8811011234567', 'Muzikayise', 'Mbatha', 'muzikayise.mbatha@yahoo.com', '0878901248', 'Male', 'KwaZulu-Natal', 'Credit Boost SA', 'Emily Clark', '2024-10-04', 'CBSA20241004-6004', 'SERVICE 2 - D4 - BELOW 12M', 20, 'Standard Bank', 'Current', '2727394041', '2025-01-23', '2025-01-25', 'NUP051', 40000.00, 2000.00, 'Active', 3, 1, '2024-10-04'),
(gen_random_uuid(), '9002122345678', 'Nosipho', 'Dlomo', 'nosipho.dlomo@gmail.com', '0889012359', 'Female', 'Eastern Cape', 'Credit Renew SA', 'Frank Miller', '2024-08-22', 'CRSA20240822-6005', 'SERVICE 3 - D4 - AITC', 24, 'Capitec', 'Savings', '2828404142', '2025-01-27', '2025-01-29', 'NUP052', 48000.00, 2000.00, 'Active', 5, 0, '2024-08-22'),
(gen_random_uuid(), '8605033456789', 'Dumisani', 'Mnguni', 'dumisani.mnguni@icloud.com', '0801234592', 'Male', 'Limpopo', 'Fix My Credit Score', 'Grace Johnson', '2024-12-16', 'FMCS20241216-6006', 'SERVICE 4 - NL/CR', 12, 'FNB', 'Cheque', '2929414243', '2025-01-09', '2025-01-11', 'NUP053', 24000.00, 2000.00, 'Pending', 0, 0, '2024-12-16'),
(gen_random_uuid(), '8908144567890', 'Nokuthula', 'Masondo', 'nokuthula.masondo@hotmail.com', '0812345693', 'Female', 'Gauteng', 'Clean Credit Consultants', 'Ryan Martinez', '2024-09-02', 'CCC20240902-6007', 'SERVICE 5 - NL ITC CLEARANCE', 18, 'ABSA', 'Savings', '3030424344', '2025-01-20', '2025-01-22', 'NUP054', 36000.00, 2000.00, 'Active', 4, 0, '2024-09-02'),
(gen_random_uuid(), '8703255678901', 'Sibongiseni', 'Ngubane', 'sibongiseni.ngubane@gmail.com', '0823456794', 'Male', 'KwaZulu-Natal', 'Increase My Credit Score', 'Kelly Davis', '2024-11-21', 'IMCS20241121-6008', 'SERVICE 6 - RN - A - NL', 15, 'Nedbank', 'Current', '3131434445', '2025-01-28', '2025-01-30', 'NUP055', 30000.00, 2000.00, 'Active', 1, 0, '2024-11-21'),
(gen_random_uuid(), '9105166789012', 'Nompilo', 'Mthiya', 'nompilo.mthiya@webmail.co.za', '0834567805', 'Female', 'Western Cape', 'Credit Boost SA', 'Derek Wilson', '2024-08-14', 'CBSA20240814-6009', 'SERVICE 7 - RN - OTHER/NL', 20, 'TymeBank', 'Savings', '3232444546', '2025-01-12', '2025-01-14', 'NUP056', 40000.00, 2000.00, 'Cancelled', 2, 6, '2024-08-14'),
(gen_random_uuid(), '8606077890123', 'Mthunzi', 'Ngcobo', 'mthunzi.ngcobo@outlook.com', '0845678916', 'Male', 'Mpumalanga', 'Credit Renew SA', 'Laura Thompson', '2024-12-07', 'CRSA20241207-6010', 'SERVICE 1 - DRR(C & D3) - P', 12, 'Standard Bank', 'Savings', '3333454647', '2025-01-05', '2025-01-07', 'NUP057', 24000.00, 2000.00, 'Active', 1, 0, '2024-12-07'),

-- Client 41-50: Remaining branches and services
(gen_random_uuid(), '8909188901234', 'Thandeka', 'Sibiya', 'thandeka.sibiya@yahoo.com', '0856789027', 'Female', 'Free State', 'Fix My Credit Score', 'Mark Rodriguez', '2024-10-11', 'FMCS20241011-7001', 'SERVICE 2 - D4 - BELOW 12M', 18, 'Capitec', 'Cheque', '3434464748', '2025-01-25', '2025-01-27', 'NUP058', 36000.00, 2000.00, 'Active', 3, 0, '2024-10-11'),
(gen_random_uuid(), '8412190123456', 'Sabelo', 'Hadebe', 'sabelo.hadebe@gmail.com', '0867890138', 'Male', 'KwaZulu-Natal', 'Clean Credit Consultants', 'Nicole Adams', '2024-08-08', 'CCC20240808-7002', 'SERVICE 3 - D4 - AITC', 24, 'FNB', 'Savings', '3535474849', '2025-01-18', '2025-01-20', 'NUP059', 48000.00, 2000.00, 'Active', 6, 0, '2024-08-08'),
(gen_random_uuid(), '8705201234567', 'Ntombi', 'Mbeki', 'ntombi.mbeki@icloud.com', '0878901249', 'Female', 'Limpopo', 'Increase My Credit Score', 'Carlos Martinez', '2024-12-22', 'IMCS20241222-7003', 'SERVICE 4 - NL/CR', 12, 'ABSA', 'Current', '3636484950', '2025-01-04', '2025-01-06', 'NUP060', 24000.00, 2000.00, 'Pending', 0, 0, '2024-12-22'),
(gen_random_uuid(), '9008011234567', 'Wandile', 'Zuma', 'wandile.zuma@hotmail.com', '0889012360', 'Male', 'Gauteng', 'Credit Boost SA', 'Stephanie King', '2024-09-29', 'CBSA20240929-7004', 'SERVICE 5 - NL ITC CLEARANCE', 15, 'Nedbank', 'Savings', '3737495051', '2025-01-26', '2025-01-28', 'NUP061', 30000.00, 2000.00, 'Active', 4, 0, '2024-09-29'),
(gen_random_uuid(), '8303122345678', 'Zinhle', 'Mthembu', 'zinhle.mthembu@gmail.com', '0801234593', 'Female', 'KwaZulu-Natal', 'Credit Renew SA', 'William Foster', '2024-11-09', 'CRSA20241109-7005', 'SERVICE 6 - RN - A - NL', 18, 'TymeBank', 'Cheque', '3838505152', '2025-01-29', '2025-01-31', 'NUP062', 36000.00, 2000.00, 'Active', 2, 1, '2024-11-09'),
(gen_random_uuid(), '8806233456789', 'Phumlani', 'Masuku', 'phumlani.masuku@webmail.co.za', '0812345694', 'Male', 'Mpumalanga', 'Fix My Credit Score', 'Diana Evans', '2024-08-26', 'FMCS20240826-7006', 'SERVICE 7 - RN - OTHER/NL', 20, 'Standard Bank', 'Savings', '3939515253', '2025-01-14', '2025-01-16', 'NUP063', 40000.00, 2000.00, 'Active', 5, 0, '2024-08-26'),
(gen_random_uuid(), '9107044567890', 'Nokwanda', 'Langa', 'nokwanda.langa@outlook.com', '0823456795', 'Female', 'Eastern Cape', 'Clean Credit Consultants', 'Jason Wright', '2024-12-13', 'CCC20241213-7007', 'SERVICE 1 - DRR(C & D3) - NP', 12, 'Capitec', 'Current', '4040525354', '2025-01-11', '2025-01-13', 'NUP064', 24000.00, 2000.00, 'Active', 1, 0, '2024-12-13'),
(gen_random_uuid(), '8604155678901', 'Mlungisi', 'Phakathi', 'mlungisi.phakathi@yahoo.com', '0834567806', 'Male', 'North West', 'Increase My Credit Score', 'Amanda Hall', '2024-09-19', 'IMCS20240919-7008', 'SERVICE 2 - D4 - BELOW 12M', 18, 'FNB', 'Savings', '4141535455', '2025-01-17', '2025-01-19', 'NUP065', 36000.00, 2000.00, 'Active', 3, 1, '2024-09-19'),
(gen_random_uuid(), '8807266789012', 'Nolwazi', 'Makhanya', 'nolwazi.makhanya@gmail.com', '0845678917', 'Female', 'Free State', 'Credit Boost SA', 'Timothy Green', '2024-12-04', 'CBSA20241204-7009', 'SERVICE 3 - D4 - AITC', 24, 'ABSA', 'Cheque', '4242545556', '2025-01-22', '2025-01-24', 'NUP066', 48000.00, 2000.00, 'Pending', 0, 0, '2024-12-04'),
(gen_random_uuid(), '9009277890123', 'Sizwe', 'Mbongwa', 'sizwe.mbongwa@icloud.com', '0856789028', 'Male', 'Western Cape', 'Credit Renew SA', 'Vanessa Moore', '2024-08-12', 'CRSA20240812-7010', 'SERVICE 4 - NL/CR', 15, 'Nedbank', 'Savings', '4343555657', '2025-01-13', '2025-01-15', 'NUP067', 30000.00, 2000.00, 'Active', 6, 0, '2024-08-12')

ON CONFLICT (client_id_number) DO NOTHING;

-- Also add corresponding queries for some of these clients
INSERT INTO "QUERIES" (
  id,
  reference_number,
  first_name,
  last_name,
  id_number,
  email,
  phone,
  query_type,
  query_text,
  status,
  created_at
) VALUES 
(gen_random_uuid(), 'EDSA20241201-1001', 'Nomsa', 'Mthembu', '8501124567089', 'nomsa.mthembu@gmail.com', '0823456789', 'APPLICATION_STATUS', 'I want to check my debt review progress', 'PENDING', '2024-12-15'),
(gen_random_uuid(), 'EDSA20241115-1002', 'Thabo', 'Mokoena', '9203158901234', 'thabo.mokoena@outlook.com', '0834567891', 'PAYMENT', 'I made my payment yesterday, please confirm', 'IN_PROGRESS', '2024-12-10'),
(gen_random_uuid(), 'SAZZ20241120-2001', 'Phindi', 'Motaung', '8701089012345', 'phindi.motaung@gmail.com', '0834567892', 'DOCUMENT', 'Please find attached my bank statement', 'RESOLVED', '2024-12-08'),
(gen_random_uuid(), 'BMCS20241102-4001', 'Lindiwe', 'Hadebe', '8803122345678', 'lindiwe.hadebe@gmail.com', '0856789024', 'GENERAL', 'When will my credit be cleared?', 'PENDING', '2024-12-12'),
(gen_random_uuid(), 'NCS20241220-5001', 'Sibusiso', 'Madondo', '8811199012345', 'sibusiso.madondo@gmail.com', '0834567803', 'COMPLAINT', 'I have not received my welcome email', 'IN_PROGRESS', '2024-12-21')

ON CONFLICT DO NOTHING;