import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
	pt: {
		translation: {
			chat: {
				sidebar: {
					title: "Chats",
					searchPlaceholder: "Procurar utilizadores",
					emptySearch: "Nenhum utilizador encontrado.",
					online: "Online",
					offline: "Offline",
					message: "Mensagem"
				},
				window: {
					selectConversation: "Selecione uma conversa para começar"
				},
				header: {
					online: "Online",
					offline: "Offline"
				},
				messageInput: {
					placeholder: "Escrever uma mensagem...",
					send: "Enviar"
				}
			},
			auth: {
				login: {
					title: 'Entrar',
					subtitle: 'Acesse sua conta para continuar no chat.',
					username: 'Nome de usuário',
					password: 'Senha',
					usernamePlaceholder: 'seu_usuario',
					passwordPlaceholder: '••••••••',
					submit: 'Entrar',
					register: 'Não tem uma conta? Cadastrar',
					errorRequired: 'Preencha nome de usuário e senha para continuar.',
					errorInvalidCredentials: 'Nome de usuário ou senha inválidos.',
					errorBackend: 'Não foi possível iniciar sessão. Tente novamente.',
					errorNetwork: 'Erro de conexão. Verifique a internet e tente novamente.'
				},
				register: {
					title: 'Cadastrar',
					subtitle: 'Crie sua conta para começar.',
					username: 'Nome de usuário',
					email: 'E-mail',
					password: 'Senha',
					confirmPassword: 'Confirmar senha',
					usernamePlaceholder: 'seu_usuario',
					emailPlaceholder: 'seuemail@dominio.com',
					passwordPlaceholder: '••••••••',
					submit: 'Criar conta',
					hasAccount: 'Já tem conta?',
					login: 'Entrar',
					errorRequired: 'Preencha nome de usuário, e-mail, senha e confirmação de senha.',
					errorPasswordMismatch: 'As senhas não coincidem.',
					errorUsernameExists: 'Já existe uma conta com esse nome de usuário.',
					errorEmailExists: 'Já existe uma conta com esse e-mail.',
					errorInvalidEmail: 'Digite um e-mail válido.',
					errorPasswordTooShort: 'A senha é muito curta.',
					errorPasswordTooCommon: 'A senha é muito comum.',
					errorPasswordNumeric: 'A senha não pode ser apenas números.',
					errorBackend: 'Não foi possível criar a conta. Verifique os dados e tente novamente.',
					errorNetwork: 'Erro de conexão. Verifique a internet e tente novamente.'
				},
			},
			settings: {
				title: "Configurações",
				settingsItem: {
					profile: {
						title: "Perfil",
						subtitle: "Nome, foto e informações da conta"
					},
					friends: {
						title: "Amigos",
						subtitle: "Gerencie seus contatos e status"
					},
					idioma: {
						title: "Idioma",
						subtitle: "Escolha o idioma do aplicativo"
					},
					security: {
						title: "Segurança",
						subtitle: "Alterar senha da conta"
					}
				},
				friendsSettings: {
					title: "Lista de amigos",
					subtitle: "Seus amigos adicionados no chat",
					searchPlaceholder: "Filtrar amigos",
					empty: "Nenhum amigo encontrado.",
					online: "Online",
					offline: "Offline",
					removeFriend: "Remover amigo",
					removeFriendAriaLabel: "Remover {{name}} da lista de amigos",
					loadingError: "Não foi possível carregar a lista de amigos.",
					removeError: "Não foi possível remover este amigo."
				},
				languageSettings: {
					title: "Idioma",
					subtitle: "Selecione o idioma preferido para o aplicativo",
					pt: "Português (PT)",
					en: "Inglês (EN)",
					fr: "Francês (FR)",
					btn_title: "Confirmar"
				},
				security: {
					title: "Segurança",
					subtitle: "Atualize a sua senha.",
					oldPassword: "Senha atual",
					newPassword: "Nova senha",
					confirmPassword: "Confirmar nova senha",
					submit: "Alterar senha",
					success: "Senha alterada com sucesso.",
					errorRequired: "Preencha todos os campos.",
					errorMismatch: "As novas senhas não coincidem.",
					errorBackend: "Não foi possível alterar a senha.",
					errorNetwork: "Erro de conexão. Verifique a internet e tente novamente."
				},
				profileSettings: {
					viewSubtitle: "Suas informações",
					editSubtitle: "Atualize suas informações",
					usernameLabel: "Nome de usuário",
					nameLabel: "Nome",
					surnameLabel: "Sobrenome",
					emailLabel: "E-mail",
					descriptionLabel: "Descrição",
					editBtn: "Alterar",
					cancelBtn: "Cancelar",
					saveBtn: "Salvar Alterações",
					changePhotoAriaLabel: "Alterar foto",
					usernamePlaceholder: "Nome de usuário",
					namePlaceholder: "Nome",
					surnamePlaceholder: "Sobrenome",
					emailPlaceholder: "E-mail",
					descriptionPlaceholder: "Descrição",
					loading: "Carregando perfil...",
					saving: "Salvando...",
					loadingError: "Erro ao carregar perfil",
					savingError: "Erro ao salvar perfil"
				}
			},
			friendProfile: {
				loading: "Carregando perfil...",
				notFound: "Utilizador não encontrado",
				invalidId: "ID de amigo inválido.",
				loadError: "Não foi possível carregar o perfil deste utilizador.",
				addError: "Não foi possível adicionar este utilizador como amigo.",
				addButton: "Adicionar amigo",
				alreadyFriend: "Já é seu amigo",
				backButton: "Voltar ao chat",
				noBio: "Sem bio",
				nameLabel: "Nome",
				usernameLabel: "Username",
				bioLabel: "Bio"
			},
			legal: {
				linksAriaLabel: "Links legais",
				lastUpdated: "Última atualização: abril de 2026",
				privacy: {
					title: "Política de Privacidade",
					sections: {
						overview: { title: "1. Visão geral", body: "Esta Política de Privacidade explica como o Zyder trata os dados pessoais usados para autenticação, perfil, lista de amigos e mensagens dentro da aplicação. O objetivo é permitir o funcionamento seguro da plataforma e informar claramente o utilizador sobre o uso dessas informações." },
						dataCollected: { title: "2. Dados recolhidos", body: "Podemos recolher nome de utilizador, e-mail, imagem de perfil, descrição da conta, preferências de idioma, lista de amigos e dados necessários para autenticação. Também podem ser processados metadados técnicos básicos para manter a sessão e proteger o serviço contra uso indevido." },
						useOfData: { title: "3. Como usamos os dados", body: "Os dados são usados para criar e gerir contas, autenticar sessões, mostrar perfis, permitir interação entre amigos e manter o funcionamento do chat. Não devem ser usados para finalidades incompatíveis com a operação normal da aplicação." },
						storage: { title: "4. Armazenamento e segurança", body: "As informações podem ser armazenadas no backend da aplicação e, em alguns casos, no navegador do utilizador para manter sessão, preferências e estado local. Devem ser aplicadas medidas razoáveis de segurança para reduzir acesso não autorizado, perda ou alteração indevida dos dados." },
						userRights: { title: "5. Direitos do utilizador", body: "O utilizador pode solicitar atualização ou remoção de dados associados à sua conta, dentro dos limites técnicos e legais aplicáveis ao projeto. Também pode terminar a sessão e rever as informações do perfil diretamente na aplicação." },
						contact: { title: "6. Contacto", body: "Para dúvidas sobre privacidade ou tratamento de dados, contacte-nos através de:"}
					}
				},
				terms: {
					title: "Termos de Serviço",
					sections: {
						acceptance: { title: "1. Aceitação dos termos", body: "Ao criar conta, iniciar sessão ou usar o Zyder, o utilizador concorda com estes Termos de Serviço. O uso da aplicação deve respeitar as regras definidas para o projeto e as leis aplicáveis." },
						account: { title: "2. Conta do utilizador", body: "O utilizador é responsável pelas credenciais da sua conta e pela veracidade básica das informações fornecidas no registo. A conta não deve ser partilhada com terceiros de forma que comprometa a segurança do serviço." },
						acceptableUse: { title: "3. Uso aceitável", body: "Não é permitido usar a aplicação para assédio, spam, envio de conteúdo malicioso, tentativa de acesso indevido ou qualquer comportamento que prejudique outros utilizadores ou a infraestrutura do projeto. A equipa pode limitar acesso em caso de uso abusivo." },
						availability: { title: "4. Disponibilidade do serviço", body: "O serviço pode sofrer interrupções, manutenção, atualizações ou limitações típicas de um projeto académico em desenvolvimento. Não há garantia de disponibilidade contínua ou ausência total de falhas." },
						termination: { title: "5. Suspensão ou encerramento", body: "O acesso do utilizador pode ser suspenso ou encerrado se houver violação destes termos, uso indevido da aplicação ou necessidade técnica relacionada à segurança e manutenção do projeto." },
						contact: { title: "6. Contacto",  body: "Para dúvidas sobre privacidade ou tratamento de dados, contacte-nos através de:"}
					}
				}
			}
		}
	},
	en: {
		translation: {
			chat: { sidebar: { title: "Chats", searchPlaceholder: "Search users", emptySearch: "No users found.", online: "Online", offline: "Offline", message: "Message" }, window: { selectConversation: "Select a conversation to start" }, header: { online: "Online", offline: "Offline" }, messageInput: { placeholder: "Write a message...", send: "Send" } },
			auth: {
				login: { title: 'Sign in', subtitle: 'Access your account to continue in chat.', username: 'Username', password: 'Password', usernamePlaceholder: 'your_username', passwordPlaceholder: '••••••••', submit: 'Sign in', register: 'Dont have an account? Sign up', errorRequired: 'Fill in username and password to continue.', errorInvalidCredentials: 'Invalid username or password.', errorBackend: 'Could not sign in. Please try again.', errorNetwork: 'Connection error. Check your internet and try again.' },
				register: { title: 'Register', subtitle: 'Create your account to get started.', username: 'Username', email: 'Email', password: 'Password', confirmPassword: 'Confirm password', usernamePlaceholder: 'your_username', emailPlaceholder: 'youremail@domain.com', passwordPlaceholder: '••••••••', submit: 'Create account', hasAccount: 'Already have an account?', login: 'Sign in', errorRequired: 'Fill in username, email, password and password confirmation.', errorPasswordMismatch: 'Passwords do not match.', errorUsernameExists: 'An account with that username already exists.', errorEmailExists: 'An account with that email already exists.', errorInvalidEmail: 'Enter a valid email address.', errorPasswordTooShort: 'The password is too short.', errorPasswordTooCommon: 'The password is too common.', errorPasswordNumeric: 'The password cannot be only numbers.', errorBackend: 'Could not create the account. Check your details and try again.', errorNetwork: 'Connection error. Check your internet and try again.' },
			},
			settings: {
				title: 'Settings',
				settingsItem: { profile: { title: 'Profile', subtitle: 'Name, photo and account information' }, friends: { title: 'Friends', subtitle: 'Manage your contacts and status' }, idioma: { title: 'Language', subtitle: 'Choose the app language' }, security: { title: 'Security', subtitle: 'Change account password' } },
				friendsSettings: { title: 'Friends list', subtitle: 'Your friends added in chat', searchPlaceholder: 'Filter friends', empty: 'No friends found.', online: 'Online', offline: 'Offline', removeFriend: 'Remove friend', removeFriendAriaLabel: 'Remove {{name}} from friends list', loadingError: 'Could not load friends list.', removeError: 'Could not remove this friend.' },
				languageSettings: { title: 'Language', subtitle: 'Select your preferred app language', pt: 'Portuguese (PT)', en: 'English (EN)', fr: 'French (FR)', btn_title: 'Confirm' },
				security: { title: 'Security', subtitle: 'Update your password.', oldPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', submit: 'Change password', success: 'Password changed successfully.', errorRequired: 'Fill in all fields.', errorMismatch: 'The new passwords do not match.', errorBackend: 'Could not change the password.', errorNetwork: 'Connection error. Check your internet and try again.' },
				profileSettings: { viewSubtitle: 'Your information', editSubtitle: 'Update your information', usernameLabel: 'Username', nameLabel: 'Name', surnameLabel: 'Surname', emailLabel: 'Email', descriptionLabel: 'Description', editBtn: 'Edit', cancelBtn: 'Cancel', saveBtn: 'Save changes', changePhotoAriaLabel: 'Change photo', usernamePlaceholder: 'Username', namePlaceholder: 'Name', surnamePlaceholder: 'Surname', emailPlaceholder: 'Email', descriptionPlaceholder: 'Description', loading: 'Loading profile...', saving: 'Saving...', loadingError: 'Error loading profile', savingError: 'Error saving profile' }
			},
			friendProfile: {
				loading: 'Loading profile...',
				notFound: 'User not found',
				invalidId: 'Invalid friend ID.',
				loadError: 'Could not load this user\'s profile.',
				addError: 'Could not add this user as a friend.',
				addButton: 'Add friend',
				alreadyFriend: 'Already your friend',
				backButton: 'Back to chat',
				noBio: 'No bio',
				nameLabel: 'Name',
				usernameLabel: 'Username',
				bioLabel: 'Bio'
			},
			legal: {
				linksAriaLabel: "Legal links",
				lastUpdated: "Last updated: April 2026",
				privacy: {
					title: "Privacy Policy",
					sections: {
						overview: { title: "1. Overview", body: "This Privacy Policy explains how Zyder handles personal data used for authentication, profile management, friends lists, and messaging inside the application. Its purpose is to support the secure operation of the platform and clearly inform users about how their information is used." },
						dataCollected: { title: "2. Data collected", body: "We may collect usernames, email addresses, profile images, account descriptions, language preferences, friends lists, and authentication-related data. Basic technical metadata may also be processed to maintain sessions and protect the service against misuse." },
						useOfData: { title: "3. How data is used", body: "Data is used to create and manage accounts, authenticate sessions, display profiles, enable interaction between friends, and support core chat functionality. It should not be used for purposes unrelated to the normal operation of the application." },
						storage: { title: "4. Storage and security", body: "Information may be stored in the application backend and, in some cases, in the user browser to preserve session state, preferences, and local data. Reasonable security measures should be applied to reduce unauthorized access, loss, or improper alteration of data." },
						userRights: { title: "5. User rights", body: "Users may request updates or removal of account-related data within the technical and legal limits applicable to the project. They may also end their session and review profile information directly in the application." },
						contact: { title: "6. Contact", body: "For privacy or data-related questions, contact us at:"}
					}
				},
				terms: {
					title: "Terms of Service",
					sections: {
						acceptance: { title: "1. Acceptance of terms", body: "By creating an account, signing in, or using Zyder, the user agrees to these Terms of Service. Use of the application must comply with the project rules and applicable law." },
						account: { title: "2. User account", body: "The user is responsible for protecting account credentials and for the basic accuracy of the information provided during registration. Accounts must not be shared in ways that compromise service security." },
						acceptableUse: { title: "3. Acceptable use", body: "The application must not be used for harassment, spam, malicious content, unauthorized access attempts, or any conduct that harms other users or the project infrastructure. The team may limit access in cases of abusive use." },
						availability: { title: "4. Service availability", body: "The service may experience interruptions, maintenance, updates, or limitations typical of an academic project under development. Continuous availability and complete absence of defects are not guaranteed." },
						termination: { title: "5. Suspension or termination", body: "User access may be suspended or terminated in case of violation of these terms, misuse of the application, or technical needs related to project security and maintenance." },
						contact: { title: "6. Contact", body: "For privacy or data-related questions, contact us at:"}
					}
				}
			}
		}
	},
	fr: {
		translation: {
			chat: { sidebar: { title: "Chats", searchPlaceholder: "Rechercher des utilisateurs", emptySearch: "Aucun utilisateur trouvé.", online: "En ligne", offline: "Hors ligne", message: "Message" }, window: { selectConversation: "Sélectionnez une conversation pour commencer" }, header: { online: "En ligne", offline: "Hors ligne" }, messageInput: { placeholder: "Écrire un message...", send: "Envoyer" } },
			auth: {
				login: { title: 'Se connecter', subtitle: 'Accédez à votre compte pour continuer dans le chat.', username: 'Nom d\'utilisateur', password: 'Mot de passe', usernamePlaceholder: 'votre_utilisateur', passwordPlaceholder: '••••••••', submit: 'Se connecter', register: "Vous n'avez pas de compte ? Inscrivez-vous", errorRequired: 'Remplissez nom d\'utilisateur et mot de passe pour continuer.', errorInvalidCredentials: 'Nom d\'utilisateur ou mot de passe invalide.', errorBackend: 'Impossible de se connecter. Réessayez.', errorNetwork: 'Erreur de connexion. Vérifiez votre internet et réessayez.' },
				register: { title: "S'inscrire", subtitle: 'Créez votre compte pour commencer.', username: 'Nom d\'utilisateur', email: 'E-mail', password: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe', usernamePlaceholder: 'votre_utilisateur', emailPlaceholder: 'votremail@domaine.com', passwordPlaceholder: '••••••••', submit: 'Créer un compte', hasAccount: 'Vous avez déjà un compte ?', login: 'Se connecter', errorRequired: 'Remplissez nom d\'utilisateur, e-mail, mot de passe et confirmation.', errorPasswordMismatch: 'Les mots de passe ne correspondent pas.', errorUsernameExists: 'Un compte avec ce nom d\'utilisateur existe déjà.', errorEmailExists: 'Un compte avec cet e-mail existe déjà.', errorInvalidEmail: 'Entrez une adresse e-mail valide.', errorPasswordTooShort: 'Le mot de passe est trop court.', errorPasswordTooCommon: 'Le mot de passe est trop courant.', errorPasswordNumeric: 'Le mot de passe ne peut pas contenir uniquement des chiffres.', errorBackend: "Impossible de créer le compte. Vérifiez vos informations et réessayez.", errorNetwork: 'Erreur de connexion. Vérifiez votre internet et réessayez.' },
			},
			settings: {
				title: 'Paramètres',
				settingsItem: { profile: { title: 'Profil', subtitle: 'Nom, photo et informations du compte' }, friends: { title: 'Amis', subtitle: 'Gérez vos contacts et leur statut' }, idioma: { title: 'Langue', subtitle: "Choisissez la langue de l'application" }, security: { title: 'Sécurité', subtitle: 'Changer le mot de passe du compte' } },
				friendsSettings: { title: 'Liste d’amis', subtitle: 'Vos amis ajoutés dans le chat', searchPlaceholder: 'Filtrer les amis', empty: 'Aucun ami trouvé.', online: 'En ligne', offline: 'Hors ligne', removeFriend: 'Supprimer l’ami', removeFriendAriaLabel: 'Supprimer {{name}} de la liste d’amis' },
				languageSettings: { title: 'Langue', subtitle: "Sélectionnez votre langue préférée pour l'application", pt: 'Portugais (PT)', en: 'Anglais (EN)', fr: 'Français (FR)', btn_title: 'Confirmer' },
				security: { title: 'Sécurité', subtitle: 'Mettez à jour votre mot de passe.', oldPassword: 'Mot de passe actuel', newPassword: 'Nouveau mot de passe', confirmPassword: 'Confirmer le nouveau mot de passe', submit: 'Changer le mot de passe', success: 'Mot de passe modifié avec succès.', errorRequired: 'Remplissez tous les champs.', errorMismatch: 'Les nouveaux mots de passe ne correspondent pas.', errorBackend: 'Impossible de changer le mot de passe.', errorNetwork: 'Erreur de connexion. Vérifiez votre internet et réessayez.' },
				profileSettings: { viewSubtitle: 'Vos informations', editSubtitle: 'Mettez à jour vos informations', usernameLabel: "Nom d'utilisateur", nameLabel: 'Prénom', surnameLabel: 'Nom', emailLabel: 'E-mail', descriptionLabel: 'Description', editBtn: 'Modifier', cancelBtn: 'Annuler', saveBtn: 'Enregistrer les modifications', changePhotoAriaLabel: 'Modifier la photo', usernamePlaceholder: "Nom d'utilisateur", namePlaceholder: 'Prénom', surnamePlaceholder: 'Nom', emailPlaceholder: 'E-mail', descriptionPlaceholder: 'Description', loading: 'Chargement du profil...', saving: 'Enregistrement...', loadingError: "Erreur lors du chargement du profil", savingError: "Erreur lors de l'enregistrement du profil" }
			},
			friendProfile: {
				loading: 'Chargement du profil...',
				notFound: 'Utilisateur non trouvé',
				invalidId: 'ID d\'ami invalide.',
				loadError: 'Impossible de charger le profil de cet utilisateur.',
				addError: 'Impossible d\'ajouter cet utilisateur comme ami.',
				addButton: 'Ajouter un ami',
				alreadyFriend: 'Déjà votre ami',
				backButton: 'Retour au chat',
				noBio: 'Pas de bio',
				nameLabel: 'Nom',
				usernameLabel: 'Nom d\'utilisateur',
				bioLabel: 'Bio'
			},
			legal: {
				linksAriaLabel: "Liens juridiques",
				lastUpdated: "Dernière mise à jour : avril 2026",
				privacy: {
					title: "Politique de confidentialité",
					sections: {
						overview: { title: "1. Vue d’ensemble", body: "Cette Politique de confidentialité explique comment Zyder traite les données personnelles utilisées pour l’authentification, le profil, la liste d’amis et la messagerie dans l’application. Son objectif est de permettre un fonctionnement sécurisé de la plateforme et d’informer clairement l’utilisateur sur l’usage de ses informations." },
						dataCollected: { title: "2. Données collectées", body: "Nous pouvons collecter le nom d’utilisateur, l’e-mail, l’image de profil, la description du compte, les préférences de langue, la liste d’amis et les données nécessaires à l’authentification. Des métadonnées techniques de base peuvent aussi être traitées pour maintenir la session et protéger le service contre les abus." },
						useOfData: { title: "3. Utilisation des données", body: "Les données sont utilisées pour créer et gérer les comptes, authentifier les sessions, afficher les profils, permettre l’interaction entre amis et assurer le bon fonctionnement du chat. Elles ne doivent pas être utilisées à des fins incompatibles avec le fonctionnement normal de l’application." },
						storage: { title: "4. Stockage et sécurité", body: "Les informations peuvent être stockées dans le backend de l’application et, dans certains cas, dans le navigateur de l’utilisateur afin de conserver la session, les préférences et l’état local. Des mesures de sécurité raisonnables doivent être appliquées pour réduire les accès non autorisés, la perte ou l’altération des données." },
						userRights: { title: "5. Droits de l’utilisateur", body: "L’utilisateur peut demander la mise à jour ou la suppression des données liées à son compte, dans les limites techniques et légales applicables au projet. Il peut aussi terminer sa session et consulter ses informations de profil directement dans l’application." },
						contact: { title: "6. Contact", body: "Pour toute question sur la confidentialité ou les données, contactez-nous à :"}
					}
				},
				terms: {
					title: "Conditions d’utilisation",
					sections: {
						acceptance: { title: "1. Acceptation des conditions", body: "En créant un compte, en se connectant ou en utilisant Zyder, l’utilisateur accepte ces Conditions d’utilisation. L’usage de l’application doit respecter les règles du projet et les lois applicables." },
						account: { title: "2. Compte utilisateur", body: "L’utilisateur est responsable de la protection des identifiants de son compte et de l’exactitude générale des informations fournies lors de l’inscription. Le compte ne doit pas être partagé d’une manière qui compromette la sécurité du service." },
						acceptableUse: { title: "3. Utilisation acceptable", body: "Il est interdit d’utiliser l’application pour le harcèlement, le spam, le contenu malveillant, les tentatives d’accès non autorisé ou tout comportement nuisible aux autres utilisateurs ou à l’infrastructure du projet. L’équipe peut limiter l’accès en cas d’usage abusif." },
						availability: { title: "4. Disponibilité du service", body: "Le service peut subir des interruptions, de la maintenance, des mises à jour ou des limitations typiques d’un projet académique en développement. Une disponibilité continue ou une absence totale d’erreurs n’est pas garantie." },
						termination: { title: "5. Suspension ou résiliation", body: "L’accès de l’utilisateur peut être suspendu ou supprimé en cas de violation de ces conditions, d’usage abusif de l’application ou de nécessité technique liée à la sécurité et à la maintenance du projet." },
						contact: { title: "6. Contact", body: "Pour toute question sur la confidentialité ou les données, contactez-nous à :" }
					}
				}
			}
		}
	}
};

const storedLanguage = localStorage.getItem('appLanguage') ?? 'pt';

i18n.use(initReactI18next).init({
	resources,
	lng: storedLanguage,
	fallbackLng: 'pt',
	interpolation: {
		escapeValue: false
	}
});

export default i18n;
