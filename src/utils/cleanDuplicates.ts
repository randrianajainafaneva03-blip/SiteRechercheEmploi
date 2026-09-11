import { databases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export const cleanDuplicates = async () => {
  try {
    console.log('🔍 Recherche des doublons...');
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      'profiles',
      [Query.limit(1000)]
    );
    
    console.log(`📊 Total profils: ${response.documents.length}`);
    
    const emailMap: { [key: string]: any[] } = {};
    
    response.documents.forEach(doc => {
      const email = doc.email?.toLowerCase();
      if (email) {
        if (!emailMap[email]) emailMap[email] = [];
        emailMap[email].push(doc);
      }
    });
    
    const duplicates = Object.entries(emailMap).filter(([_, docs]) => docs.length > 1);
    
    console.log(`🔴 ${duplicates.length} emails avec doublons`);
    
    if (duplicates.length === 0) {
      alert('✅ Aucun doublon trouvé !');
      return;
    }
    
    duplicates.forEach(([email, docs]) => {
      console.log(`\n📧 ${email} (${docs.length} profils)`);
      docs.forEach(doc => {
        console.log(`  - ${doc.user_type?.toUpperCase()}: ${doc.full_name} (${doc.$id})`);
      });
    });
    
    const confirm = window.confirm(`${duplicates.length} emails avec doublons trouvés. Lancer le nettoyage ?`);
    
    if (!confirm) return;
    
    console.log('\n🔄 Début nettoyage...\n');
    
    let deleted = 0;
    
    for (const [email, docs] of duplicates) {
      const employers = docs.filter(d => d.user_type === 'employer');
      const candidates = docs.filter(d => d.user_type === 'candidate');
      
      let toKeep, toDelete;
      
      if (employers.length > 0 && candidates.length > 0) {
        toKeep = employers[0];
        toDelete = [...candidates, ...employers.slice(1)];
        console.log(`✅ ${email}: Garder EMPLOYEUR ${toKeep.$id}`);
      } else {
        const sorted = docs.sort((a, b) => 
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
        toKeep = sorted[0];
        toDelete = sorted.slice(1);
        console.log(`✅ ${email}: Garder plus récent ${toKeep.$id}`);
      }
      
      for (const doc of toDelete) {
        console.log(`  ❌ Suppression ${doc.user_type} ${doc.$id}`);
        try {
          await databases.deleteDocument(DATABASE_ID, 'profiles', doc.$id);
          deleted++;
          console.log(`    ✅ Supprimé`);
        } catch (err: any) {
          console.error(`    ❌ Erreur:`, err.message);
        }
      }
    }
    
    console.log(`\n✅ ${deleted} profils supprimés !`);
    alert(`✅ Nettoyage terminé ! ${deleted} profils supprimés.`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('❌ Erreur lors du nettoyage');
  }
};