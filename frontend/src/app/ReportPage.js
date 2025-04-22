import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import '../styles/Report.css';

const ReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [testId, setTestId] = useState('');
  const [username, setUsername] = useState('');
  const [date, setDate] = useState('');
  const [antibioticName, setAntibioticName] = useState('');
  const antibioticList = [
    "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", "AMS: Ampicillin-sulbactam", "ATM: Aztreonam", "AZM: Azithromycin",
    "CAZ: Ceftazidime", "CAZ-AVI: Ceftazidime-avibactam", "CEC: Cefaclor", "CFDC: Cefiderocol", "CFM: Cefixime", "CFP: Cefoperazone",
    "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CLDM: Clindamycin",
    "CMZ: Cefmetazole", "COL: Colistin", "CPD: Cefpodoxime", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten",
    "CTX: Cefotaxime", "CTT: Cefotetan", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZO: Cefazolin", "CZA: Ceftolozane-avibactam",
    "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin",
    "ETP: Ertapenem", "FEP: Cefepime", "FLX: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", "GAT: Gatifloxacin",
    "GEM: Gemifloxacin", "GEN: Gentamicin", "GPFX: Grepafloxacin", "IMI-REL: Imipenem-relebactam", "IMR: Imipenem-relebactam", "IPM: Imipenem",
    "KAN: Kanamycin", "LOR: Loracarbef", "LOM: Lomefloxacin", "LVX: Levofloxacin", "LZD: Linezolid", "MAN: Cefamandole",
    "MEC: Mecillinam", "MEM: Meropenem", "MFX: Moxifloxacin", "MNO: Minocycline", "MOX: Moxalactam", "MVB: Meropenem-vaborbactam",
    "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", "OFX: Ofloxacin", "ORI: Oritavancin",
    "PCN: Penicillin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", "PLZ: Plazomicin", "PMB: Polymyxin B", "PRL: Piperacillin",
    "Q/D: Quinupristin-dalfopristin", "RIF: Rifampin", "SPX: Sparfloxacin", "SPT: Spectinomycin", "SSS: Sulfonamides", "STR: Streptomycin",
    "SXT: Trimethoprim-sulfamethoxazole","TGC: Tigecycline", "TCY: Tetracycline", "TEC: Teicoplanin", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin",
    "TVA: Trovafloxacin", "TZD: Tedizolid", "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"
  ];

  const fetchLatestData = () => {
    fetch('http://localhost:3001/ASTtest/report/latest')
      .then((response) => response.json())
      .then((data) => {
        setReportData(data);
      })
      .catch((error) => console.error('Error fetching latest data:', error));
  };

  const fetchReportData = () => {
    let url = 'http://localhost:3001/ASTtest/report/search?';

    if (testId) url += `test_id=${testId}&`;
    if (username) url += `username=${username}&`;
    if (date) url += `date=${date}&`;
    if (antibioticName) url += `antibiotic_name=${antibioticName}&`;

    url = url.slice(0, -1);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setReportData(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchLatestData(); 
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };


  // Flatten the data to prepare for CSV export
  const flattenDataForCSV = () => {
    return reportData.reduce((flatData, row) => {
      const flattenedRow = row.inhibition_zone_history.map((zone) => ({
        test_id: row.test_id,
        bacteria_name: row.bacteria_name,
        username: zone.username,
        performed_at: formatDate(zone.performed_at),
        antibiotic_name: zone.antibiotic_name,
        diameter: zone.diameter,
        interpretation: zone.resistant,
        number_of_test: zone.number_of_test,
      }));
      return [...flatData, ...flattenedRow];
    }, []);
  };
  

  return (
    <div className="report-page">
      <div className="query-container">
        <div className="test-id-container">
          <label>View Report by Test ID </label>
          <div className="test-id-input-container">
            <input 
              type="number" 
              value={testId} 
              onChange={(e) => setTestId(e.target.value)} 
              className="test-id-input" 
            />
            <button className="search-btn" onClick={fetchReportData}>Search</button>
          </div>
        </div>

        <div className="inputs-row">
          <div className="input-container">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>

          <div className="input-container">
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>

          <div className="input-container">
            <label>Antibiotic Name</label>
            <select value={antibioticName} onChange={(e) => setAntibioticName(e.target.value)}>
              <option value="">Select an Antibiotic</option>
              {antibioticList.map((antibiotic, index) => (
                <option key={index} value={antibiotic}>{antibiotic}</option>
              ))}
            </select>
          </div>
        </div>


      </div>
      <div className="table-container">
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Bacteria Name</th>
                <th>Performed by</th>
                <th>Performed At</th>
                <th>Antibiotic Name</th>
                <th>Diameter</th>
                <th>Interpretation</th>
                <th>Number of Test</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                row.inhibition_zone_history.map((zone, idx) => (
                  <tr key={`${index}-${idx}`}>
                    <td>{row.test_id}</td>
                    <td>{row.bacteria_name}</td>
                    <td>{zone.username}</td>

                    {/* <td>{row.created_at}</td> */}
                    <td>{formatDate(zone.performed_at)}</td>

                    <td>{zone.antibiotic_name}</td>
                    <td>{zone.diameter}</td>
                    <td>{zone.resistant}</td>
                    <td>{zone.number_of_test}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="export-button-container">
        <CSVLink
          // data={reportData}
          data={flattenDataForCSV()}  // Pass flattened data to CSVLink
          filename={'Report.csv'}
          className="export-btn"
        >
          Export to CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default ReportPage;
