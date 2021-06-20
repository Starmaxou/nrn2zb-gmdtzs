declare var CUB: any;

// Couches restantes à charger
let remaining = 4;
let loadingPanel;

CUB.ready(() => {
  // Initialisation de l'API CUB
  CUB.init(document.getElementById('map'), {
    extent: [1411539.71, 4185738.74, 1424239.7, 4192214.41]
  });

  // Création du Panel conteneur de la mire
  loadingPanel = new CUB.Panel({
    width: 48,
    height: 48,
    top: CUB.getHeight() / 2 - 24,
    left: CUB.getWidth() / 2 - 24,
    content:
      '<img src="//data.bordeaux-metropole.fr/dev/exemples/samples/loading.gif" style="border: 1px solid black"/>'
  });

  //  Chargement des lignes de tram
  const lignes = [
    { ligneGid: 59, nom: 'Ligne A', label: 'A', color: '#81197F' },
    { ligneGid: 60, nom: 'Ligne B', label: 'B', color: '#DA003E' },
    { ligneGid: 61, nom: 'Ligne C', label: 'C', color: '#D15094' },
    { ligneGid: 62, nom: 'Ligne D', label: 'D', color: '#91619D' }
  ];

  const lignes_bus = [
    { ligneGid: 6, nom: 'Liane 8', label: '8', color: '#81197F' },
    { ligneGid: 130, nom: 'Bat3', label: 'Bat', color: '#81197F' }
  ];

  for (const ligne of lignes) {
    createLigne(ligne.ligneGid, ligne.nom, ligne.color);
    createTram(ligne.ligneGid, ligne.label, ligne.color);
  }

  for (const ligne of lignes_bus) {
    createLigne(ligne.ligneGid, ligne.nom, ligne.color);
    createBus(ligne.ligneGid, ligne.label, ligne.color);
  }
});

/**
 * Charge une ligne de tram sur la carte
 * @param ligneGid GID de la ligne
 * @param nom
 */
function createLigne(ligneGid: number, nom: string, color: string) {
  const layer = new CUB.Layer.Dynamic(
    nom,
    '//data.bordeaux-metropole.fr/wfs?key=258BILMNYZ',
    {
      layerName: 'SV_CHEM_L',
      // Filtre sur l'ID de la ligne + uniquement les chemins principaux
      wfsFilter: `<And><PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo><PropertyIsEqualTo><PropertyName>PRINCIPAL</PropertyName><Literal>1</Literal></PropertyIsEqualTo></And>`,
      propertyname: ['GID', 'LIBELLE'],
      loadAllAtOnce: true,
      style: new CUB.Style({
        // Style par défaut
        color: new CUB.Color(color)
      })
    }
  );

  // Callback de fin de chargement
  layer.onLoadEnd = () => onLayerLoadEnd(layer);

  return layer;
}

/**
 * Crée la couche des véhivules
 */
function createTram(ligneGid: number, label: string, color: string) {
  const layer = new CUB.Layer.Dynamic(
    'Tram ' + label,
    '//data.bordeaux-metropole.fr/wfs?key=258BILMNYZ',
    {
      layerName: 'SV_VEHIC_P',
      // Filtre sur l'ID de la ligne + uniquement les chemins principaux
      wfsFilter: `<PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo>`,
      propertyname: ['GEOM', 'TERMINUS', 'ETAT'],
      loadAllAtOnce: true,
      refreshInterval: 10000,
      style: new CUB.Style({
        // Style par défaut
        symbol: `https://data.bordeaux-metropole.fr/opendemos/assets/images/saeiv/tram_${label.toLowerCase()}.png`,
        opacity: 100,
        size: 10,
        labelColor: new CUB.Color(color),
        labelOutlineWidth: 1.5,
        labelSize: 12,
        labelBold: true,
        label: '${TERMINUS}' + '\n' + '${ETAT}', // Libellé de l'étiquette
        labelYOffset: -15,
        labelMaxScaledenom: 25000
      })
    }
  );
}

/**
 * Crée la couche des véhivules
 */
function createBus(ligneGid: number, label: string, color: string) {
  const layer = new CUB.Layer.Dynamic(
    'Tram ' + label,
    '//data.bordeaux-metropole.fr/wfs?key=258BILMNYZ',
    {
      layerName: 'SV_VEHIC_P',
      // Filtre sur l'ID de la ligne + uniquement les chemins principaux
      wfsFilter: `<PropertyIsEqualTo><PropertyName>RS_SV_LIGNE_A</PropertyName><Literal>${ligneGid}</Literal></PropertyIsEqualTo>`,
      propertyname: ['GEOM', 'TERMINUS'],
      loadAllAtOnce: true,
      refreshInterval: 10000,
      style: new CUB.Style({
        // Style par défaut
        symbol: `https://data.bordeaux-metropole.fr/opendemos/assets/images/saeiv/tram_${label.toLowerCase()}.png`,
        opacity: 100,
        size: 10,
        labelColor: new CUB.Color(color),
        labelOutlineWidth: 1.5,
        labelSize: 12,
        labelBold: true,
        label: '${TERMINUS}', // Libellé de l'étiquette
        labelYOffset: -15,
        labelMaxScaledenom: 25000
      })
    }
  );
}

/**
 * Fin de chargement d'une couche WFS
 * @param layer La couche WFS
 */
function onLayerLoadEnd(layer) {
  --remaining;

  if (remaining === 0) loadingPanel.disable();
}
