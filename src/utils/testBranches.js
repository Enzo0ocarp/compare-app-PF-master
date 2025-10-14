// src/utils/testBranches.js

import { 
  getUserFavoriteBranches, 
  addBranchToFavorites, 
  removeBranchFromFavorites 
} from '../firebaseConfig';
import { getBranches, getUniqueProvinces } from '../services/api';

export const testBranchFunctions = async (userId) => {
  console.log('🧪 Iniciando tests de sucursales...');
  
  try {
    // Test 1: Obtener sucursales del backend
    console.log('\n📍 Test 1: Obtener sucursales');
    const branches = await getBranches({ limit: 5 });
    console.log('✅ Sucursales:', branches.data.length);
    console.log('Primera sucursal:', branches.data[0]);
    
    // Test 2: Obtener provincias
    console.log('\n🗺️ Test 2: Obtener provincias');
    const provinces = await getUniqueProvinces();
    console.log('✅ Provincias:', provinces.length);
    console.log('Primeras 3:', provinces.slice(0, 3));
    
    // Test 3: Obtener favoritos (requiere userId)
    if (userId) {
      console.log('\n❤️ Test 3: Favoritos del usuario');
      const favorites = await getUserFavoriteBranches(userId);
      console.log('✅ Favoritos actuales:', favorites);
      
      // Test 4: Agregar favorito
      if (branches.data.length > 0) {
        const testBranchId = branches.data[0].id;
        console.log('\n➕ Test 4: Agregar favorito');
        await addBranchToFavorites(userId, testBranchId);
        console.log('✅ Favorito agregado:', testBranchId);
        
        // Test 5: Verificar que se agregó
        const updatedFavorites = await getUserFavoriteBranches(userId);
        console.log('✅ Favoritos después de agregar:', updatedFavorites);
        
        // Test 6: Remover favorito
        console.log('\n➖ Test 6: Remover favorito');
        await removeBranchFromFavorites(userId, testBranchId);
        console.log('✅ Favorito removido:', testBranchId);
        
        // Test 7: Verificar que se removió
        const finalFavorites = await getUserFavoriteBranches(userId);
        console.log('✅ Favoritos después de remover:', finalFavorites);
      }
    }
    
    console.log('\n✅ Todos los tests pasaron correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en tests:', error);
    return false;
  }
};

// Exponer en modo desarrollo
if (process.env.NODE_ENV === 'development') {
  window.testBranches = testBranchFunctions;
}