import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import '../styles/Report.css';

const ReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [testId, setTestId] = useState('');
  const [username, setUsername] = useState('');
  const [date, setDate] = useState('');
  const [antibioticName, setAntibioticName] = useState('');
  const antibioticList = [": Penicillin", "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", 
    "ATM: Aztreonam", "AZM: Azithromycin", "CAT: Cefetamet", "CAZ: Ceftazidime", "CDR: Cefdinir", "CEC: Cefaclor", 
    "CFM: Cefixime", "CFP: Cefoperazone", "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", 
    "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CMZ: Cefmetazole", "COL: Colistin", "COP/POL: Colistin or polymyxin B", 
    "CPD: Cefpodoxime", "CPR: Cefprozil", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten", "CTT: Cefotetan", 
    "CTX: Cefotaxime", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZA: Ceftazidime-avibactam", "CZO: Cefazolin", 
    "CZO: Cefazolin (surrogate test for oral cephalosporins and uncomplicated UTIs)", "CZT: Ceftolozane-tazobactam", 
    "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin", 
    "ETP: Ertapenem", "FDC: Cefonicid", "FEP: Cefepime", "FLE: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", 
    "GAT: Gatifloxacin", "GEM: Gemifloxacin", "GEN: Gentamicin", "GRX: Grepafloxacin", "IMR: Imipenem-relebactam", 
    "IPM: Imipenem", "KAN: Kanamycin", "LNZ: Linezolid", "LOM: Lomefloxacin", "LOR: Loracarbef", "LVX: Levofloxacin", 
    "MAN: Cefamandole", "MEC: Mecillinam", "MEM: Meropenem", "MEV: Meropenem-vaborbactam", "MFX: Moxifloxacin", 
    "MNO: Minocycline", "MOX: Moxalactam", "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", 
    "OFX: Ofloxacin", "ORI: Oritavancin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", 
    "POL: Polymyxin B", "PRL: Pirlimycin", "QDA: Quinupristin-dalfopristin", "RIF: Rifampin", "SAM: Ampicillin-sulbactam", 
    "SAMSAM: Ampicillin-sulbactam", "SPX: Sparfloxacin", "SSS: Sulfonamides", "STR: Streptomycin", "SXT: Trimethoprim- sulfamethoxazole", 
    "SXT: Trimethoprim-sulfamethoxazole", "TCC: Ticarcillin-clavulanate", "TCY: Tetracycline", "TEC: Teicoplanin", 
    "TGC: Tigecycline", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin", "TVA: Trovafloxacin", "TZD: Tedizolid", 
    "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"];

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
          data={reportData}
          filename={'experiment_report.csv'}
          className="export-btn"
        >
          Export to CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default ReportPage;
