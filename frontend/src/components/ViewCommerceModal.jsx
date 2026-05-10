export default function ViewCommerceModal({ commerce, onClose }) {
      if (!commerce) return null;

        return (
            <div style={overlay}>
                  <div style={modal}>
                          <h2>📍 Détails du commerce</h2>

                                  <p><b>Nom :</b> {commerce.name}</p>
                                          <p><b>Description :</b> {commerce.description}</p>
                                                  <p><b>Catégorie :</b> {commerce.category?.name}</p>
                                                          <p><b>Type :</b> {commerce.type?.name}</p>
                                                                  <p><b>Latitude :</b> {commerce.latitude}</p>
                                                                          <p><b>Longitude :</b> {commerce.longitude}</p>
                                                                                  <p><b>Adresse :</b> {commerce.address}</p>
                                                                                          <p><b>Téléphone :</b> {commerce.phone}</p>
                                                                                                  <p><b>Horaires :</b> {commerce.opening_hours}</p>

                                                                                                          <button onClick={onClose} style={{ marginTop: 10 }}>
                                                                                                                    Fermer
                                                                                                                            </button>
                                                                                                                                  </div>
                                                                                                                                      </div>
                                                                                                                                        );
                                                                                                                                        }

                                                                                                                                        const overlay = {
                                                                                                                                          position: "fixed",
                                                                                                                                            top: 0,
                                                                                                                                              left: 0,
                                                                                                                                                width: "100%",
                                                                                                                                                  height: "100%",
                                                                                                                                                    background: "rgba(0,0,0,0.5)",
                                                                                                                                                      display: "flex",
                                                                                                                                                        justifyContent: "center",
                                                                                                                                                          alignItems: "center"
                                                                                                                                                          };

                                                                                                                                                          const modal = {
                                                                                                                                                            background: "#fff",
                                                                                                                                                              padding: 20,
                                                                                                                                                                width: 350,
                                                                                                                                                                  borderRadius: 10
                                                                                                                                                                  };
