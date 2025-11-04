document.addEventListener('DOMContentLoaded', () => {
  const buildingsList = [
    { id: 'eitc-e1', name: 'EITC E1', info: 'Engineering and Information Technology Complex - Building E1' },
    { id: 'eitc-e2', name: 'EITC E2', info: 'Engineering and Information Technology Complex - Building E2' },
    { id: 'eitc-e3', name: 'EITC E3', info: 'Engineering and Information Technology Complex - Building E3' },
    { id: 'drake', name: 'Drake Centre', info: 'Drake Centre - Asper School of Business' },
    { id: 'helen-glass', name: 'Helen Glass', info: 'Helen Glass Centre for Nursing' },
    { id: 'education', name: 'Education', info: 'Education Building' },
    { id: 'fletcher', name: 'Fletcher', info: 'Fletcher Argue Building' },
    { id: 'armes', name: 'Armes', info: 'Armes Building' },
    { id: 'allen', name: 'Allen', info: 'Allen Building' },
    { id: 'buller', name: 'Buller', info: 'Buller Building' },
    { id: 'parker', name: 'Parker', info: 'Parker Building' }
  ];

  const buildingsContainer = document.getElementById('buildingsContainer');
  buildingsContainer.innerHTML = ''; // Clear any existing content

  buildingsList.forEach(building => {
    const button = document.createElement('button');
    button.className = 'building-button';
    button.setAttribute('data-building-id', building.id);
    button.innerHTML = `
      <span class="building-name">${building.name}</span>
      <span class="building-info">${building.info}</span>
    `;
    button.addEventListener('click', () => {
      // Handle building button click
      console.log(`Clicked ${building.name}`);
      // Add your building click handler logic here
    });
    buildingsContainer.appendChild(button);
  });
});