import React, { useState, useEffect } from 'react';
import { QrCode, Home, History, AlertTriangle, CheckCircle, ArrowRight, Zap, Brain, Shield, Camera, BarChart3, Apple, X, User } from 'lucide-react';

const NutritionScannerDemo = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState('3017620422003'); // Nutella par défaut
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);

  // Codes-barres de vrais produits pour la démo
  const realProducts = [
    { barcode: '3017620422003', name: 'Nutella' },
    { barcode: '3274080005003', name: 'Evian' },
    { barcode: '3017620425035', name: 'Kinder Bueno' },
    { barcode: '8076800195057', name: 'Barilla Pâtes' },
    { barcode: '3029330003533', name: 'Vache qui rit' }
  ];

  // Fonction pour générer un code-barres SVG réaliste
  const generateBarcode = (code) => {
    const patterns = {
      '0': [3,2,1,1], '1': [2,2,2,1], '2': [2,1,2,2], '3': [1,4,1,1], '4': [1,1,3,2],
      '5': [1,2,3,1], '6': [1,1,1,4], '7': [1,3,1,2], '8': [1,2,1,3], '9': [3,1,1,2]
    };
    
    let bars = [1,1,1]; // Start pattern
    
    for (let digit of code) {
      const pattern = patterns[digit] || patterns['0'];
      bars = bars.concat(pattern);
    }
    
    bars = bars.concat([1,1,1]); // End pattern
    
    return bars;
  };

  // Base de données nutritionnelle intégrée (données réelles d'OpenFoodFacts)
  const nutritionDatabase = {
    '3017620422003': { // Nutella
      name: "Nutella",
      brands: "Ferrero",
      nutritionScore: "E",
      sugar: 56.3,
      fat: 30.9,
      salt: 0.107,
      calories: 539,
      ingredients: ["Sucre", "Huile de palme", "Noisettes", "Cacao maigre en poudre", "Lait écrémé en poudre"],
      image: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.jpg",
      nova: 4
    },
    '3274080005003': { // Evian
      name: "Evian",
      brands: "Evian",
      nutritionScore: "A",
      sugar: 0,
      fat: 0,
      salt: 0.002,
      calories: 0,
      ingredients: ["Eau minérale naturelle"],
      image: "https://images.openfoodfacts.org/images/products/327/408/000/5003/front_fr.jpg",
      nova: 1
    },
    '3017620425035': { // Kinder Bueno
      name: "Kinder Bueno",
      brands: "Ferrero",
      nutritionScore: "E",
      sugar: 49.5,
      fat: 35.6,
      salt: 0.259,
      calories: 571,
      ingredients: ["Chocolat au lait", "Sucre", "Huile de palme", "Noisettes", "Lait écrémé en poudre"],
      image: "https://images.openfoodfacts.org/images/products/301/762/042/5035/front_fr.jpg",
      nova: 4
    },
    '8076800195057': { // Barilla Pâtes
      name: "Pâtes Barilla",
      brands: "Barilla",
      nutritionScore: "A",
      sugar: 3.2,
      fat: 1.8,
      salt: 0.013,
      calories: 351,
      ingredients: ["Semoule de blé dur", "Eau"],
      image: "https://images.openfoodfacts.org/images/products/807/680/019/5057/front_fr.jpg",
      nova: 1
    },
    '3029330003533': { // Vache qui rit
      name: "La Vache qui rit",
      brands: "Bel",
      nutritionScore: "D",
      sugar: 3.2,
      fat: 22,
      salt: 2.3,
      calories: 285,
      ingredients: ["Fromages", "Eau", "Sels de fonte", "Lactosérum en poudre"],
      image: "https://images.openfoodfacts.org/images/products/302/933/000/3533/front_fr.jpg",
      nova: 3
    }
  };

  // Fonction IA pour analyser les données nutritionnelles
  const analyzeNutritionWithAI = (nutritionData) => {
    const alerts = [];
    
    // Algorithme IA pour les alertes de sucre
    if (nutritionData.sugar > 30) {
      alerts.push({
        type: "sugar",
        message: `⚠️ Taux de sucre très élevé (${nutritionData.sugar}g/100g) - Risque diabète`,
        severity: "high"
      });
    } else if (nutritionData.sugar > 15) {
      alerts.push({
        type: "sugar", 
        message: `⚠️ Taux de sucre élevé (${nutritionData.sugar}g/100g)`,
        severity: "medium"
      });
    }
    
    // Algorithme IA pour les alertes de sel
    if (nutritionData.salt > 2) {
      alerts.push({
        type: "salt",
        message: `🧂 Taux de sel très élevé (${nutritionData.salt}g/100g) - Hypertension`,
        severity: "high"
      });
    } else if (nutritionData.salt > 1.5) {
      alerts.push({
        type: "salt",
        message: `🧂 Taux de sel élevé (${nutritionData.salt}g/100g)`,
        severity: "medium"
      });
    }

    // Algorithme IA pour les graisses saturées
    if (nutritionData.fat > 25) {
      alerts.push({
        type: "fat",
        message: `🫄 Taux de matières grasses très élevé (${nutritionData.fat}g/100g)`,
        severity: "medium"
      });
    }
    
    // Algorithme IA pour le degré de transformation (NOVA)
    if (nutritionData.nova >= 4) {
      alerts.push({
        type: "processing",
        message: "🏭 Produit ultra-transformé (NOVA 4) - Éviter si possible",
        severity: "medium"
      });
    }

    // Algorithme IA pour les calories
    if (nutritionData.calories > 500) {
      alerts.push({
        type: "calories",
        message: `⚡ Très calorique (${nutritionData.calories} kcal/100g) - Consommer avec modération`,
        severity: "low"
      });
    }

    return alerts;
  };

  // Fonction IA pour générer des alternatives personnalisées
  const generateAIAlternatives = (productData) => {
    const baseAlternatives = [
      { name: "Alternative bio équivalente", score: "B", description: "Version bio du même type de produit" },
      { name: "Option faible en sucre", score: "A", description: "Même catégorie, moins de sucre ajouté" },
      { name: "Alternative maison", score: "A", description: "Préparez-le vous-même pour contrôler les ingrédients" }
    ];

    // IA personnalisée selon le type de produit
    if (productData.sugar > 30) {
      return [
        { name: "Pâte à tartiner sans sucre ajouté", score: "B", description: "Alternative avec édulcorants naturels" },
        { name: "Purée de noisettes 100%", score: "A", description: "Sans sucre, riche en bonnes graisses" },
        { name: "Chocolat noir 85%", score: "B", description: "Moins sucré, plus de cacao" }
      ];
    }
    
    if (productData.salt > 2) {
      return [
        { name: "Version allégée en sel", score: "B", description: "Même marque, formulation réduite en sodium" },
        { name: "Alternative fraîche", score: "A", description: "Produit frais non transformé" },
        { name: "Fait maison", score: "A", description: "Contrôlez la quantité de sel ajoutée" }
      ];
    }

    if (productData.calories === 0) {
      return [
        { name: "Eau filtrée", score: "A", description: "Solution économique et écologique" },
        { name: "Eau pétillante nature", score: "A", description: "Pour varier les plaisirs" },
        { name: "Infusion de fruits", score: "A", description: "Saveur naturelle sans additifs" }
      ];
    }

    return baseAlternatives;
  };

  // Fonction simulant l'analyse IA (remplace l'API OpenFoodFacts)
  const fetchProductData = async (barcode) => {
    setIsLoading(true);
    
    // Simulation du temps d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const nutritionData = nutritionDatabase[barcode];
      
      if (!nutritionData) {
        return {
          name: "Produit non reconnu par l'IA",
          barcode: barcode,
          nutritionScore: "N/A",
          sugar: 0,
          fat: 0,
          salt: 0,
          calories: 0,
          ingredients: [],
          alerts: [{
            type: "info",
            message: "🤖 Ce produit n'est pas encore dans notre base de données IA",
            severity: "low"
          }]
        };
      }

      // Application de l'IA d'analyse nutritionnelle
      const processedData = {
        ...nutritionData,
        barcode: barcode,
        alerts: analyzeNutritionWithAI(nutritionData)
      };

      return processedData;
      
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      return {
        name: "Erreur d'analyse IA",
        barcode: barcode,
        nutritionScore: "N/A",
        sugar: 0,
        fat: 0,
        salt: 0,
        calories: 0,
        ingredients: [],
        alerts: [{
          type: "error",
          message: "🤖 Erreur temporaire de l'IA nutritionnelle",
          severity: "medium"
        }]
      };
    } finally {
      setIsLoading(false);
    }
  };

  const historyData = [
    { date: "23/05/2025", product: "Nutella", score: "E", time: "08:30" },
    { date: "23/05/2025", product: "Evian", score: "A", time: "16:45" },
    { date: "22/05/2025", product: "Kinder Bueno", score: "E", time: "14:20" },
    { date: "22/05/2025", product: "Pâtes Barilla", score: "A", time: "12:15" },
    { date: "21/05/2025", product: "La Vache qui rit", score: "D", time: "19:30" }
  ];

  const simulateScan = async () => {
    setIsScanning(true);
    setScanComplete(false);
    setScanningProgress(0);
    
    // Animation de progression du scan
    const progressInterval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Progression aléatoire mais constante
      });
    }, 200);
    
    // Simulation du scan (2.5 secondes)
    setTimeout(async () => {
      setIsScanning(false);
      setScanComplete(true);
      clearInterval(progressInterval);
      setScanningProgress(100);
      
      // Récupération des vraies données via IA
      const data = await fetchProductData(selectedBarcode);
      setProductData(data);
      
      setTimeout(() => {
        setCurrentPage('analysis');
        if (data.alerts && data.alerts.length > 0) {
          setShowAlert(true);
        }
      }, 1000);
    }, 2500);
  };

  const resetDemo = () => {
    setScanComplete(false);
    setShowAlert(false);
    setProductData(null);
    setScanningProgress(0);
    setShowProfileDropdown(false);
    setCurrentPage('home');
  };

  // Composant du dropdown de profil
  const ProfileDropdown = ({ onClose }) => (
    <div className="absolute top-16 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold">JD</span>
          </div>
          <div>
            <div className="font-semibold text-gray-800">John Doe</div>
            <div className="text-sm text-gray-500">Utilisateur Premium</div>
          </div>
        </div>
      </div>
      <div className="py-2">
        <button 
          onClick={() => {
            onClose();
            // Vous pouvez ajouter la navigation vers les paramètres ici
            console.log('Paramètres du compte');
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700"
        >
          <div className="w-5 h-5 mr-3 text-gray-400">⚙️</div>
          Paramètres du compte
        </button>
        <button 
          onClick={() => {
            onClose();
            // Vous pouvez ajouter la logique de déconnexion ici
            console.log('Déconnexion');
          }}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-red-600"
        >
          <div className="w-5 h-5 mr-3 text-red-400">🚪</div>
          Déconnexion
        </button>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Header avec profil */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">NutriScan IA</h1>
              <p className="text-sm text-gray-600">Bonjour John !</p>
            </div>
          </div>
          
          {/* Icône de profil */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <span className="text-white font-semibold text-sm">JD</span>
            </button>
            
            {showProfileDropdown && (
              <>
                {/* Overlay pour fermer le dropdown */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileDropdown(false)}
                ></div>
                <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
              </>
            )}
          </div>
        </div>

        {/* Description principale */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Analysez vos aliments intelligemment</h2>
          <p className="text-gray-600 text-lg">Scannez, analysez, mangez mieux avec l'IA</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center mb-3">
              <QrCode className="w-8 h-8 text-emerald-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Scan Intelligent</h3>
            </div>
            <p className="text-gray-600">Scannez n'importe quel code-barres pour une analyse nutritionnelle instantanée</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100">
            <div className="flex items-center mb-3">
              <Shield className="w-8 h-8 text-teal-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Alertes Santé</h3>
            </div>
            <p className="text-gray-600">Recevez des alertes personnalisées selon votre profil de santé</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center mb-3">
              <Apple className="w-8 h-8 text-green-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Alternatives Saines</h3>
            </div>
            <p className="text-gray-600">Découvrez des alternatives plus saines adaptées à vos besoins</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <button 
            onClick={() => setCurrentPage('scanner')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          >
            <Camera className="w-6 h-6 mr-2" />
            Commencer le scan
          </button>
          
          <button 
            onClick={() => setCurrentPage('history')}
            className="w-full bg-white text-gray-700 py-4 rounded-2xl font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center border border-gray-200"
          >
            <History className="w-6 h-6 mr-2" />
            Voir l'historique
          </button>
        </div>

        {/* Stats rapides */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
            Vos statistiques
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-500">15</div>
              <div className="text-xs text-gray-600">Produits scannés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">B+</div>
              <div className="text-xs text-gray-600">Score moyen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">8</div>
              <div className="text-xs text-gray-600">Alertes évitées</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ScannerPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 relative">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between text-white mb-8 pt-4">
          <button onClick={() => setCurrentPage('home')} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Scanner le produit</h2>
          <button onClick={() => setCurrentPage('history')} className="p-2">
            <History className="w-6 h-6" />
          </button>
        </div>

        {/* Product Selector for Demo */}
        <div className="mb-6">
          <select 
            value={selectedBarcode} 
            onChange={(e) => setSelectedBarcode(e.target.value)}
            className="w-full bg-white/10 text-white rounded-xl p-3 border border-white/20"
          >
            {realProducts.map(product => (
              <option key={product.barcode} value={product.barcode} className="text-gray-800">
                {product.name} - {product.barcode}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-300 mt-2 text-center">↑ Sélectionnez un produit pour la démo</p>
        </div>

        {/* Scanner Area */}
        <div className="relative mb-8">
          <div className="w-full h-80 bg-black rounded-2xl relative overflow-hidden border-4 border-white/20">
            {/* Scanner overlay avec animations améliorées */}
            <div className="absolute inset-4 border-2 border-emerald-400 rounded-xl">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
              
              {/* Animations de scan améliorées - Style détection IA */}
              {isScanning && (
                <>
                  {/* Ligne de scan principale qui monte et descend */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse">
                      <div 
                        className="h-full bg-emerald-400 shadow-lg"
                        style={{
                          animation: 'scanLine 2s ease-in-out infinite alternate',
                          boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Rectangle de détection IA vert autour du code-barres */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="border-2 border-emerald-400 rounded-lg animate-pulse"
                      style={{
                        width: '200px',
                        height: '90px',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                        animation: 'detectBox 1.5s ease-in-out infinite'
                      }}
                    >
                      {/* Coins de détection IA */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-300"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-300"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-300"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-300"></div>
                      
                      {/* Indicateur de confiance IA */}
                      <div className="absolute -top-8 left-0 text-emerald-400 text-xs font-mono bg-black/50 px-2 py-1 rounded backdrop-blur">
                        IA: {Math.min(95, Math.round(scanningProgress))}% confidence
                      </div>
                    </div>
                  </div>
                  
                  {/* Lignes de scan secondaires */}
                  <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-60">
                    <div className="h-full bg-emerald-300 animate-ping"></div>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-40">
                    <div className="h-full bg-emerald-300 animate-pulse"></div>
                  </div>
                  
                  {/* Points de tracking IA */}
                  <div className="absolute inset-0">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping"
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${40 + Math.sin(Date.now() / 1000 + i) * 20}%`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: '1.5s'
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Grille de détection subtile */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-6 h-full">
                      {[...Array(48)].map((_, i) => (
                        <div 
                          key={i} 
                          className="border border-emerald-400/30"
                          style={{
                            animation: `gridFlash ${1 + Math.random()}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Emplacement pour l'image du code-barres Coca-Cola */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  {/* REMPLACEZ CE BLOC PAR VOTRE IMAGE COCA-COLA */}
                  {/* Exemple : <img src="votre-image-coca-cola.jpg" alt="Code-barres Coca-Cola" className="w-48 h-32 object-contain" /> */}
                  
                  {/* Code-barres temporaire (à remplacer) */}
                  <svg width="180" height="60" className="mb-2">
                    {generateBarcode(selectedBarcode).map((width, idx) => (
                      <rect 
                        key={idx}
                        x={idx * 3} 
                        y="10" 
                        width={width * 2} 
                        height="40"
                        fill={idx % 2 === 0 ? "black" : "white"}
                      />
                    ))}
                  </svg>
                  <div className="text-xs text-center font-mono text-gray-800">{selectedBarcode}</div>
                  <div className="text-xs text-center text-gray-600">
                    {realProducts.find(p => p.barcode === selectedBarcode)?.name}
                  </div>
                  
                  {/* Effet de pulsation pendant le scan */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-lg animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Animation de succès */}
            {scanComplete && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-lg animate-bounce">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            )}

            {/* Barre de progression */}
            {isScanning && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-300 ease-out"
                    style={{ width: `${scanningProgress}%` }}
                  ></div>
                </div>
                <p className="text-white text-xs text-center mt-2">
                  Analyse IA : {Math.round(scanningProgress)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions avec status IA */}
        <div className="text-center text-white mb-8">
          <p className="text-lg mb-2 font-semibold">
            {isScanning ? "🤖 IA Vision • Détection en cours..." : "Pointez vers le code-barres"}
          </p>
          <p className="text-sm text-gray-300">
            {isScanning ? 
              `Analyse des formes • Lecture du code • Confiance: ${Math.min(95, Math.round(scanningProgress))}%` : 
              "IA prête à analyser instantanément"
            }
          </p>
          {isLoading && (
            <div className="mt-3 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm">🧠 Traitement par intelligence artificielle...</span>
            </div>
          )}
          
          {/* Status de détection IA */}
          {isScanning && (
            <div className="mt-4 bg-black/50 backdrop-blur rounded-xl p-3 mx-8">
              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
                  <span>Vision IA: Active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                  <span>Détection: {Math.round(scanningProgress)}%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                  <span>Analyse: {scanningProgress > 70 ? 'En cours' : 'En attente'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scan button amélioré */}
        <button 
          onClick={simulateScan}
          disabled={isScanning || isLoading}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
            isScanning || isLoading
              ? 'bg-gray-600 text-gray-300' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isScanning ? (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center mb-1">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Vision IA • Détection: {Math.round(scanningProgress)}%</span>
              </div>
              <div className="text-sm opacity-75">
                {scanningProgress < 30 ? "🔍 Localisation du code-barres..." :
                 scanningProgress < 60 ? "📖 Lecture des données..." :
                 scanningProgress < 90 ? "🧠 Analyse nutritionnelle..." :
                 "✨ Finalisation..."}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Génération des recommandations IA...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Brain className="w-5 h-5 mr-2" />
              Activer la Vision IA
            </div>
          )}
        </button>

        {/* AI Info */}
        <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur">
          <div className="flex items-center text-white mb-2">
            <Brain className="w-5 h-5 mr-2 text-emerald-400" />
            <span className="font-semibold">IA Nutritionnelle Propriétaire</span>
          </div>
          <p className="text-sm text-gray-300">
            Algorithmes d'analyse avancés • Base de données nutritionnelle intégrée • Recommandations personnalisées
          </p>
        </div>
      </div>
    </div>
  );

  const AnalysisPage = () => {
    if (!productData) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données nutritionnelles...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Product Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-b-3xl">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentPage('home')} className="p-2">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold">Analyse Nutritionnelle IA</h2>
              <button onClick={() => setCurrentPage('history')} className="p-2">
                <History className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{productData.name}</h3>
                  {productData.brands && (
                    <p className="text-sm opacity-90 mb-2">{productData.brands}</p>
                  )}
                  <span className="text-sm opacity-90">Code: {productData.barcode}</span>
                </div>
                {productData.image && (
                  <img 
                    src={productData.image} 
                    alt={productData.name}
                    className="w-16 h-16 rounded-lg object-cover ml-4"
                  />
                )}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 opacity-90" />
                  <span className="text-sm opacity-90">Analysé par IA nutritionnelle</span>
                </div>
                {productData.nutritionScore !== 'N/A' && (
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    productData.nutritionScore === 'A' ? 'bg-green-500' :
                    productData.nutritionScore === 'B' ? 'bg-yellow-500' :
                    productData.nutritionScore === 'C' ? 'bg-orange-500' :
                    productData.nutritionScore === 'D' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}>
                    Nutri-Score {productData.nutritionScore}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 -mt-6">
          {/* Alerts */}
          {showAlert && productData.alerts && productData.alerts.length > 0 && (
            <div className={`rounded-2xl shadow-lg mb-6 border-l-4 animate-pulse ${
              productData.alerts.some(alert => alert.severity === 'high') 
                ? 'bg-red-50 border-red-500' 
                : 'bg-yellow-50 border-yellow-500'
            }`}>
              <div className="p-6">
                <div className="flex items-start">
                  <AlertTriangle className={`w-6 h-6 mr-3 mt-1 ${
                    productData.alerts.some(alert => alert.severity === 'high') 
                      ? 'text-red-500' 
                      : 'text-yellow-500'
                  }`} />
                  <div>
                    <h4 className={`font-semibold mb-2 ${
                      productData.alerts.some(alert => alert.severity === 'high') 
                        ? 'text-red-800' 
                        : 'text-yellow-800'
                    }`}>
                      🤖 Alerte IA Personnalisée
                    </h4>
                    {productData.alerts.map((alert, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <p className={`text-sm font-medium ${
                          alert.severity === 'high' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Facts */}
          <div className="bg-white rounded-2xl shadow-lg mb-6">
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
                Valeurs Nutritionnelles (pour 100g)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(productData.calories || 0)}
                  </div>
                  <div className="text-sm text-gray-600">kcal</div>
                </div>
                <div className={`rounded-xl p-4 ${
                  productData.sugar > 15 ? 'bg-red-50' : 
                  productData.sugar > 5 ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    productData.sugar > 15 ? 'text-red-600' : 
                    productData.sugar > 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {productData.sugar?.toFixed(1) || '0'}g
                  </div>
                  <div className={`text-sm ${
                    productData.sugar > 15 ? 'text-red-600' : 
                    productData.sugar > 5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>Sucres</div>
                </div>
                <div className={`rounded-xl p-4 ${
                  productData.fat > 20 ? 'bg-red-50' : 
                  productData.fat > 10 ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    productData.fat > 20 ? 'text-red-600' : 
                    productData.fat > 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {productData.fat?.toFixed(1) || '0'}g
                  </div>
                  <div className={`text-sm ${
                    productData.fat > 20 ? 'text-red-600' : 
                    productData.fat > 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>Matières grasses</div>
                </div>
                <div className={`rounded-xl p-4 ${
                  productData.salt > 1.5 ? 'bg-red-50' : 
                  productData.salt > 0.5 ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className={`text-2xl font-bold ${
                    productData.salt > 1.5 ? 'text-red-600' : 
                    productData.salt > 0.5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {productData.salt?.toFixed(1) || '0'}g
                  </div>
                  <div className={`text-sm ${
                    productData.salt > 1.5 ? 'text-red-600' : 
                    productData.salt > 0.5 ? 'text-yellow-600' : 'text-green-600'
                  }`}>Sel</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          {productData.ingredients && productData.ingredients.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg mb-6">
              <div className="p-6">
                <h4 className="font-semibold text-gray-800 mb-4">🧪 Ingrédients principaux</h4>
                <div className="flex flex-wrap gap-2">
                  {productData.ingredients.slice(0, 8).map((ingredient, idx) => (
                    <span 
                      key={idx} 
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {ingredient.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI-Generated Alternatives */}
          <div className="bg-white rounded-2xl shadow-lg mb-6">
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Apple className="w-5 h-5 mr-2 text-green-500" />
                🤖 Alternatives IA Recommandées
              </h4>
              <div className="space-y-3">
                {generateAIAlternatives(productData).map((alt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{alt.name}</div>
                      <div className="text-sm text-gray-600">{alt.description}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ml-3 ${
                      alt.score === 'A' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {alt.score}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  <Brain className="w-4 h-4 inline mr-1" />
                  Recommandations basées sur l'analyse IA de {productData.ingredients?.length || 0} ingrédients et {productData.alerts?.length || 0} alertes nutritionnelles
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={() => setCurrentPage('scanner')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scanner un autre produit
            </button>
            <button 
              onClick={() => setCurrentPage('history')}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-semibold flex items-center justify-center"
            >
              <History className="w-5 h-5 mr-2" />
              Voir l'historique
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HistoryPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm p-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentPage('home')} className="p-2">
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Historique</h2>
            <button onClick={() => setCurrentPage('scanner')} className="p-2">
              <QrCode className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="p-6">
          <div className="space-y-4">
            {historyData.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 transform hover:scale-105 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.product}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <span>{item.date} • {item.time}</span>
                      <div className="ml-3 flex items-center">
                        <Brain className="w-3 h-3 text-emerald-500 mr-1" />
                        <span className="text-xs text-emerald-600">Analysé par IA</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                    item.score === 'A' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                    item.score === 'B' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                    item.score === 'D' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
                    'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}>
                    {item.score}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-emerald-500" />
              Statistiques IA de la semaine
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="transform hover:scale-110 transition-all duration-200">
                <div className="text-2xl font-bold text-emerald-500">15</div>
                <div className="text-xs text-gray-600">Produits analysés</div>
              </div>
              <div className="transform hover:scale-110 transition-all duration-200">
                <div className="text-2xl font-bold text-yellow-500">47%</div>
                <div className="text-xs text-gray-600">Score nutritionnel moyen</div>
              </div>
              <div className="transform hover:scale-110 transition-all duration-200">
                <div className="text-2xl font-bold text-blue-500">8</div>
                <div className="text-xs text-gray-600">Alertes IA générées</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-700 text-center">
                🤖 IA a détecté 3 produits ultra-transformés cette semaine
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-6">
          <button 
            onClick={() => setCurrentPage('scanner')}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Nouveau scan IA
          </button>
        </div>
      </div>
    </div>
  );

  // Navigation
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'scanner': return <ScannerPage />;
      case 'analysis': return <AnalysisPage />;
      case 'history': return <HistoryPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="font-sans">
      {/* CSS personnalisé pour les animations IA */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scanLine {
            0% { top: 10%; }
            100% { top: 90%; }
          }
          
          @keyframes detectBox {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 0 30px rgba(16, 185, 129, 0.8);
            }
          }
          
          @keyframes gridFlash {
            0%, 90% { opacity: 0; }
            50% { opacity: 0.3; }
          }
          
          .scan-line-animation {
            animation: scanLine 2s ease-in-out infinite alternate;
          }
        `
      }} />
      
      {renderCurrentPage()}
      
      {/* Demo Reset Button (for presentation) */}
      {currentPage !== 'home' && (
        <div className="fixed bottom-4 right-4">
          <button 
            onClick={resetDemo}
            className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-gray-700 transition-colors"
          >
            Reset Démo
          </button>
        </div>
      )}
    </div>
  );
};

export default NutritionScannerDemo;
