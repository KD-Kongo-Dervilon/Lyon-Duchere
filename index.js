document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("management-form");
    const idField = document.getElementById("id-unique");

    // Générer un ID unique
    function generateUniqueID() {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        return `ID-${timestamp}-${randomNum}`;
    }

    // Affecter un ID unique au champ ID unique
    idField.value = generateUniqueID();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Validation des fichiers requis
        const medicalCertificate = document.getElementById("medical-certificate").files[0];
        const identityPhoto = document.getElementById("identity-photo").files[0];

        if (!medicalCertificate || !identityPhoto) {
            alert("Veuillez fournir tous les fichiers requis : certificat médical et photo d'identité.");
            return;
        }

        // Validation des champs requis
        const requiredFields = [
            "last-name",
            "first-name",
            "age",
            "email",
            "phone",
            "payment-mode",
            "activity",
            "status",
        ];

        let isValid = true;
        const formDataObject = {};
        requiredFields.forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
                showFieldError(field);
            } else {
                formDataObject[fieldId] = field.value.trim();
            }
        });

        // Ajouter les fichiers au formDataObject
        formDataObject["identity_photo"] = identityPhoto;
        formDataObject["medical_certificate"] = medicalCertificate.name;

        if (!isValid) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        // Afficher la carte de validation
        showSummaryCard(formDataObject, identityPhoto);
    });

    function showSummaryCard(data, photoFile) {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("summary-card");

        const reader = new FileReader();
        reader.onload = () => {
            cardContainer.innerHTML = `
                <h2>Résumé des informations</h2>
                <img src="${reader.result}" alt="Photo d'identité" class="identity-photo-preview" />
                <p><strong>Nom :</strong> ${data["last-name"]}</p>
                <p><strong>Prénom :</strong> ${data["first-name"]}</p>
                <p><strong>Âge :</strong> ${data["age"]}</p>
                <p><strong>Email :</strong> ${data["email"]}</p>
                <p><strong>Téléphone :</strong> ${data["phone"]}</p>
                <p><strong>Mode de paiement :</strong> ${data["payment-mode"]}</p>
                <p><strong>Activité :</strong> ${data["activity"]}</p>
                <p><strong>Statut :</strong> ${data["status"]}</p>
                <button id="confirm-btn" class="confirm-btn">Confirmer</button>
                <button id="edit-btn" class="edit-btn">Éditer</button>
                <button id="delete-btn" class="delete-btn">Supprimer</button>
            `;

            document.body.appendChild(cardContainer);

            // Ajouter des événements aux boutons
            document.getElementById("confirm-btn").addEventListener("click", () => submitForm(data));
            document.getElementById("edit-btn").addEventListener("click", () => {
                document.body.removeChild(cardContainer);
            });
            document.getElementById("delete-btn").addEventListener("click", () => {
                document.body.removeChild(cardContainer);
                alert("La carte a été supprimée.");
            });
        };

        // Lire le fichier de photo pour l'afficher
        reader.readAsDataURL(photoFile);
    }

    function submitForm(data) {
        // Ajouter la validation automatique de `is_valid`
        data["is_valid"] = "Oui";

        // Ajouter la date de création
        data["creation_date"] = new Date().toISOString();

        // FormData pour l'envoi
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        // Envoyer les données au webhook
        fetch("https://hook.eu2.make.com/11w325nqthpw5jiaxd4pm607v5u9hnii", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erreur lors de l'envoi des données");
                }
                alert("Inscription enregistrée avec succès !");
                form.reset();
                idField.value = generateUniqueID();
                const card = document.querySelector(".summary-card");
                if (card) document.body.removeChild(card);
            })
            .catch((error) => {
                console.error("Erreur :", error);
                alert("Une erreur est survenue lors de l'envoi.");
            });
    }

    // Affiche une erreur visuelle pour un champ non valide
    function showFieldError(field) {
        if (field) {
            const errorElement = field.nextElementSibling;
            if (errorElement) {
                errorElement.textContent = "Ce champ est requis.";
                errorElement.style.display = "block";
            }
        }
    }
});