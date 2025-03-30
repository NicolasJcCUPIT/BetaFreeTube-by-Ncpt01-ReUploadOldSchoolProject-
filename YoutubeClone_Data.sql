-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : jeu. 22 août 2024 à 01:22
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `FreeTube`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnements`
--

CREATE TABLE `abonnements` (
  `a_id` int(11) NOT NULL,
  `a_abo_fk` varchar(20) NOT NULL,
  `a_abonnement_fk` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `abonnements`
--

INSERT INTO `abonnements` (`a_id`, `a_abo_fk`, `a_abonnement_fk`) VALUES
(2, 'mestre.cine', 'mike'),
(3, 'mike', 'nihno'),
(4, 'ncupit999', 'mestre.cine'),
(9, 'mike', 'benjamin.code');

--
-- Déclencheurs `abonnements`
--
DELIMITER $$
CREATE TRIGGER `decrementAbo` AFTER DELETE ON `abonnements` FOR EACH ROW BEGIN
    UPDATE utilisateurs
    SET u_t_abos = u_t_abos - 1
    WHERE OLD.a_abonnement_fk = utilisateurs.u_ftb_nom;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `incrementAbo` AFTER INSERT ON `abonnements` FOR EACH ROW BEGIN
    UPDATE utilisateurs
    SET u_t_abos = u_t_abos + 1
    WHERE NEW.a_abonnement_fk = utilisateurs.u_ftb_nom;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `catfreetube`
--

CREATE TABLE `catfreetube` (
  `c_cat_nom` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `catfreetube`
--

INSERT INTO `catfreetube` (`c_cat_nom`) VALUES
('animations'),
('animaux'),
('astrologie'),
('automobile'),
('blogs'),
('cinema'),
('commerce'),
('critiques'),
('divertissement'),
('education'),
('enfants'),
('freetube'),
('humour'),
('informatique'),
('jeux'),
('journalisme'),
('ludique'),
('meditation'),
('musique'),
('politique'),
('sciences'),
('tv'),
('voyages');

-- --------------------------------------------------------

--
-- Structure de la table `commentaires`
--

CREATE TABLE `commentaires` (
  `c_id` int(11) NOT NULL,
  `c_video_id_fk` int(11) NOT NULL,
  `c_auth_fk` varchar(20) NOT NULL,
  `c_txt` varchar(400) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commentaires`
--

INSERT INTO `commentaires` (`c_id`, `c_video_id_fk`, `c_auth_fk`, `c_txt`) VALUES
(2, 1, 'benjamin.code', 'Belle vidéo, j\'aime beaucoup.'),
(3, 1, 'mestre.cine', 'Hâte de la prochaine vidéo!'),
(4, 7, 'benjamin.code', 'Encore un banger!'),
(5, 13, 'mestre.cine', 'J\'ai vu tes commentaires sur ma chaîne, tes vidéo sont superbes Benjamin!'),
(6, 11, 'benjamin.code', 'Le roi du rap, sans css ni artifices!'),
(7, 11, 'mestre.cine', 'Tout en vvs!'),
(8, 12, 'benjamin.code', 'Actuellement dans le RED D, mdr...'),
(9, 11, 'ncupit999', 'Waaa');

--
-- Déclencheurs `commentaires`
--
DELIMITER $$
CREATE TRIGGER `decrement_video_comments` AFTER DELETE ON `commentaires` FOR EACH ROW BEGIN
    UPDATE videos
    SET v_t_commentaires = v_t_commentaires - 1
    WHERE v_id = OLD.c_video_id_fk;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `increment_video_comments` AFTER INSERT ON `commentaires` FOR EACH ROW BEGIN
    UPDATE videos
    SET v_t_commentaires = v_t_commentaires + 1
    WHERE v_id = NEW.c_video_id_fk;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `plalist_noms`
--

CREATE TABLE `plalist_noms` (
  `pn_id` int(11) NOT NULL,
  `pn_nom` varchar(40) NOT NULL,
  `pn_auth_fk` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `plalist_noms`
--

INSERT INTO `plalist_noms` (`pn_id`, `pn_nom`, `pn_auth_fk`) VALUES
(1, 'À consulter plus tard', 'mestre.cine'),
(2, 'Historique', 'mestre.cine'),
(3, 'jaime', 'mestre.cine'),
(13, 'À consulter plus tard', 'nihno'),
(14, 'Historique', 'nihno'),
(15, 'jaime', 'nihno'),
(16, 'À consulter plus tard', 'benjamin.code'),
(17, 'Historique', 'benjamin.code'),
(18, 'jaime', 'benjamin.code'),
(19, 'À consulter plus tard', 'ncupit999'),
(20, 'Historique', 'ncupit999'),
(21, 'jaime', 'ncupit999'),
(25, 'À consulter plus tard', 'mike'),
(26, 'Historique', 'mike'),
(27, 'jaime', 'mike');

-- --------------------------------------------------------

--
-- Structure de la table `playlists`
--

CREATE TABLE `playlists` (
  `p_id` int(11) NOT NULL,
  `p_pn_id_fk` int(11) NOT NULL,
  `p_v_id_fk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `playlists`
--

INSERT INTO `playlists` (`p_id`, `p_pn_id_fk`, `p_v_id_fk`) VALUES
(1, 20, 11),
(2, 21, 13),
(4, 19, 11),
(16, 25, 7),
(19, 27, 12),
(34, 26, 11),
(35, 26, 11),
(39, 26, 7),
(40, 26, 7),
(41, 26, 7),
(42, 27, 12),
(43, 26, 11),
(44, 25, 12),
(45, 26, 12),
(47, 26, 11),
(48, 26, 11),
(50, 27, 12),
(51, 26, 12),
(52, 26, 12),
(56, 27, 11),
(57, 26, 11),
(58, 26, 13),
(59, 26, 12);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `u_id` int(11) NOT NULL,
  `u_ftb_nom` varchar(20) NOT NULL,
  `u_nom` varchar(2000) NOT NULL,
  `u_prenom` varchar(2000) NOT NULL,
  `u_email` varchar(320) NOT NULL,
  `u_passwd` varchar(2000) NOT NULL,
  `u_pp` varchar(300) NOT NULL,
  `u_description` varchar(160) DEFAULT 'FreeTube channel!',
  `u_t_commentaires` int(11) DEFAULT 0,
  `u_t_jaimes` int(11) DEFAULT 0,
  `u_t_abos` int(11) DEFAULT 0,
  `u_t_vues` int(11) DEFAULT 0,
  `u_age` varchar(2000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`u_id`, `u_ftb_nom`, `u_nom`, `u_prenom`, `u_email`, `u_passwd`, `u_pp`, `u_description`, `u_t_commentaires`, `u_t_jaimes`, `u_t_abos`, `u_t_vues`, `u_age`) VALUES
(1, 'mestre.cine', 'c8718cf7b95e8c91584f60505926218869a883404a3e82445231f7df6a389c7e7857aa31c55bb8dc376047b9e4fc23cda2ccfd10f27d068de6aa19a110765c6800cfc08c83cba804976929c904a1314cf0867b32a41438f4d07ec765161eb68e3a9a1f61209fdfc558', '8a673d69a30c125fcb36c0e982d0777da876bb2ba87d1d1ea9abfa9ba71aec723958be2995e5fe0b7d48faf52bcc872c933398cc97aeba5ff877a43f6a214c0d1da24f1c193424d50d688a1140f17ad3d914b372950262d49d2a006204ead53c716669b6c61ec5', '$argon2i$v=19$m=65536,t=20,p=4$UDBAU1cxMkRGdnZQMFhTU1FaWkRGTkpMT1jCpDJ2Zg$bkuPKo2ukhMMuBB625URtaLpu5NBBPKUiknVxg', '$argon2i$v=19$m=65536,t=20,p=4$mib12/LDDfWMNbmFSBhlbw$OoxHaCwark2zg3yWEhmnnHyP3H3qcl/PuPxH9g', 'data/profil/Profil1.png', 'Recap ciné, séries!', 3, 54, 21, 190, 'bdb24e5fd0420e9d83016ab69b623e9dbd8f71165b3517a9c3c7cd6c41cc9c0f66929e7b1e6eca68f9263dfe365ec67aabe6038a8aace38737572fc753499a2d7a3f2e6ba4853f435b9c8c5400e4f8104ea2518929c3149665431837f2a36a9f44d1'),
(8, 'nihno', 'cff836854af9ac5f53ff8899652b5ca6066e3425c185d86bf9c243210ed21c7ca03648cd5ad49e50e04184cc69e23644db281f965fd6a6ae018a432355d96c54965e8c33125960496766a78b5af373cd6041007e32462d52d174e6499f0b298d3f20ce5be5c21e', '653131f02ec8f1df43a41f40b2f17e07c4e1a3bf6e9b75901054e189a10d69ee16341518b0676e73c7e6b616a83f11b2cd136f013d5ed5d1223af87fc7f550e47a482ffa6ff3677e91f622aaa9ba3f7ffa2bcacd77efae5a0b781ccf7931d7d2d55a704923', '$argon2i$v=19$m=65536,t=20,p=4$UDBAU1cxMkRGdnZQMFhTU1FaWkRGTkpMT1jCpDJ2Zg$nD8/uCEfGgLGf3SYVPITF/uWwvheBrQWIlL3qg', '$argon2i$v=19$m=65536,t=20,p=4$Ta4HZT252kHv16X68T0ObA$KOOuSF2q3PRFPJsZGQFPYCwMOo/xxJ3iUgfVqg', 'data/profil/Profil8.jpg', 'Salut salut, binks!!!', 4, 1110, 2001, 4000143, '7eceb0cf45db3a17a6e187f532813c86423fd304db94c48e0eb91dea1039c9e4166b3cf68f20bad7b935dc4963d83561ff1cb1c79c0c50e819d089d5f46858e4f48df4f7c8d37ed89bdd529ee25562801a9bf09f65bb88ec2c02cab496727603be6f'),
(9, 'benjamin.code', 'c5428931f6b8673047162e942b19afbb2c372df437c10ccb1cf814bcac6d2d8855910804cdcd1953e3f1d8058d2b2af24c1faaf07337e302745427fcef5e2e561179c67193356e776469031bce580657447f529aa5f799b62d512e24599b80550775bcbd77f8b3', '3685b81670a3f7e538bd284eff98b506c64d72143a4754eb05a9d070163a5433741cf9de5ea9b542527dcf8b523eb4576123c2c3fca677116c8c26d18f0dfba7ee183c98e70e676d37db5799a421f8a96634f3db0a05e9f37101ddab50cb1dfb640297c41b6ef975', '$argon2i$v=19$m=65536,t=20,p=4$UDBAU1cxMkRGdnZQMFhTU1FaWkRGTkpMT1jCpDJ2Zg$nfovS77eYFqDS8vGB6nOXbNHPqIYY3xcU3m9gA', '$argon2i$v=19$m=65536,t=20,p=4$/a5CoJlczJsRvFg+2R4MBQ$Db8ZD4TmQ27B1r2YJMvSP1Ydl9ilUKkjPO0kpw', 'data/defaut_assets/YoutubeClone_DefautPP.png', 'FreeTube channel!', 1, 706, 33, 10069, '74c324aa72331194c92f50d3139bd06810203e77ea67fe25a5f44e3aa5ca1915b789c5efdff983035cc5722a16a6edf37a54ddf6f0532a319dd4c775971bf69facb34d7e219070cec164db639d33d8b70f7cc2a3da64b66e29e31fd962a5e76b56fb'),
(10, 'ncupit999', '5c05140b93d3622e3f53680857add123213dfdcee8d28b9ee620a8381df076c9980a55370cbaefa9567b32bad00c2ead28d17caeaf9bb683667e05a7c1fb2dc1dd3c16e884e35e8370d88a7cbcf9c07004dced7d4f4d2a919ad82d0496bc7b158c71d6a341', 'e274f5a45df1c576458b63633a3eae91f6f26a31939fc769993c1ba06acbf8670ce58411ccedb718d219129d379717a74e93eb180d331731ebc953b28cbeaeb85946c41b0848735c6f9564648f21dcdcb3134c69e08e0a520ed22483abd0bde3d7f611580c3793', '$argon2i$v=19$m=65536,t=20,p=4$UDBAU1cxMkRGdnZQMFhTU1FaWkRGTkpMT1jCpDJ2Zg$RF3W0/Bjw1pv7mr6Z9XNzOtUDtPW3dA2QzARLQ', '$argon2i$v=19$m=65536,t=20,p=4$q3WhpYNcggCh7xEA/AziXw$Dk2Em/rf/yyjO5PJGjNAZRqQRZieVB/JGZrh+g', 'data/defaut_assets/YoutubeClone_DefautPP.png', 'FreeTube channel!', 0, 0, 0, 0, '09f149f7cbb0202ae4e922b798828bea9d2c72eeb9f73c1eba5661d36741b997bfa2370c31d2a0802b3375237590ad672e1936436d0140cb26075334ca1e4fa9ff97245d3d97a477b00fae60d7457202de2c5a151c5c891cbe8734713905ffca7afb'),
(13, 'mike', '5e24e0bfdd861333f8a26f1e910fb213153a5ff5111298fa00bdddd81dd3fd1d8d8a358f7065a28d3141fb08b99aae2be013a4b79d3bc7ec12025271ff491fc39904a4e13667a566a16375ea8fea96759229315bc1e70fcb5911d03e28d07d49d502e40201', '42deb45a1fc24f40df4ebfd8a1cf4cd6baf3205e45b83a43a84b68db9e8c31d36dc7950a9ce9f3eb80d991cc58fd078205901ea0a535c8b6efc7161448dc76a1d07be755287e7dc3c16c1d6b5f9a50104eda03dacc5acc505b33bb76e1a51b6cb4747308', '$argon2i$v=19$m=65536,t=20,p=4$UDBAU1cxMkRGdnZQMFhTU1FaWkRGTkpMT1jCpDJ2Zg$YKMoqnk0H1uS+YgjmUTBdjE3HHXQjqrCZhlbIg', '$argon2i$v=19$m=65536,t=20,p=4$8LegHeBHVbXTEfMx7HaGHA$OpiCumyQobfMT55npO5Y6J1M02FnfFm3dlLf6A', 'data/defaut_assets/YoutubeClone_DefautPP.png', 'FreeTube channel!', 0, 0, 1, 0, '5bcfa51bca90cb90a33ff3070166db80e2dda2f9e2cc6ca9a6499761feddaeaffe59e451bfd8a20063de5eb04f4b5e5ec81fc366934dcde3c56b9e9b9c26f7037c1ddcee0ebfb6f06fa5d1fb48ad8976addd464d27b2ad93e0ef694d021b163a507b');

--
-- Déclencheurs `utilisateurs`
--
DELIMITER $$
CREATE TRIGGER `defaut_playlists` AFTER INSERT ON `utilisateurs` FOR EACH ROW BEGIN
    INSERT INTO plalist_noms (pn_nom, pn_auth_fk) VALUES ('À consulter plus tard', NEW.u_ftb_nom);
    INSERT INTO plalist_noms (pn_nom, pn_auth_fk) VALUES ('Historique', NEW.u_ftb_nom);
    INSERT INTO plalist_noms (pn_nom, pn_auth_fk) VALUES ('jaime', NEW.u_ftb_nom);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `videos`
--

CREATE TABLE `videos` (
  `v_id` int(11) NOT NULL,
  `v_titre` varchar(60) DEFAULT 'SANS TITRE',
  `v_auth_fk` varchar(20) NOT NULL,
  `v_miniature` varchar(2000) NOT NULL,
  `v_video` varchar(2000) NOT NULL,
  `v_description` varchar(300) DEFAULT 'FreeTube video!',
  `v_tag1` varchar(20) DEFAULT '',
  `v_tag2` varchar(20) DEFAULT '',
  `v_tag3` varchar(20) DEFAULT '',
  `v_tag4` varchar(20) DEFAULT '',
  `v_tag5` varchar(20) DEFAULT '',
  `v_tag6` varchar(20) DEFAULT '',
  `v_tag7` varchar(20) DEFAULT '',
  `v_tag8` varchar(20) DEFAULT '',
  `v_tag9` varchar(20) DEFAULT '',
  `v_tag10` varchar(20) DEFAULT '',
  `v_categorie_fk` varchar(200) DEFAULT 'freetube',
  `v_t_jaimes` int(11) DEFAULT 0,
  `v_t_commentaires` int(11) DEFAULT 0,
  `v_t_vues` int(11) DEFAULT 0,
  `v_statut` tinyint(1) DEFAULT 1,
  `v_DATE` datetime DEFAULT current_timestamp(),
  `v_majeur` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `videos`
--

INSERT INTO `videos` (`v_id`, `v_titre`, `v_auth_fk`, `v_miniature`, `v_video`, `v_description`, `v_tag1`, `v_tag2`, `v_tag3`, `v_tag4`, `v_tag5`, `v_tag6`, `v_tag7`, `v_tag8`, `v_tag9`, `v_tag10`, `v_categorie_fk`, `v_t_jaimes`, `v_t_commentaires`, `v_t_vues`, `v_statut`, `v_DATE`, `v_majeur`) VALUES
(1, 'analyse saison 2, house of the dragon', 'mestre.cine', 'data/miniatures/1_34945.png', 'data/videos/1_34945.mp4', 'Analyse et théories, de la saison 2!', '#FreeTube', '#Mestre', '#Goth', '#Goth', '', '', '', '', '', '', 'freetube', 40, 2, 100, 1, '2024-09-01 01:32:27', 1),
(7, 'les dragons de la maison targaryen', 'mestre.cine', 'data/miniatures/1_53308.png', 'data/videos/1_53308.mp4', 'Présentations des dragons de la saison 2 de House of the dragons!', '#goth', '#mestre', '#freetube', '#freetube', '#explore', '', '#explore', '#explore', '#explore', '#explore', 'freetube', 14, 1, 90, 1, '2024-08-11 14:15:47', 1),
(11, 'nihno -vvs (audio officiel)', 'nihno', 'data/miniatures/8_41731.jpg', 'data/videos/8_41731.mp4', 'Premier single de mon album \"lécole c\'est top!\"', '#binkz', '#vvs', '#freetube', '#freetube', '#lebonheur', '#vvs', '', '', '', '', 'freetube', 705, 3, 3000102, 1, '2024-08-11 22:50:38', 1),
(12, 'nihno -rer d (audio officiel)', 'nihno', 'data/miniatures/8_34611.jpg', 'data/videos/8_34611.mp4', 'Deuxième single de mon album \"lécole c\'est top!\"', '#binkz', '', '#freetube', '#freetube', '', '#vvs', '', '', '', '', 'freetube', 405, 1, 1000041, 1, '2024-08-11 23:00:19', 1),
(13, 'mon saas m\'a rendu riche! #codemoment episode 1.', 'benjamin.code', 'data/miniatures/9_23879.jpg', 'data/videos/9_23879.mp4', 'J\'ai enfin lancé mon Saas, et je t\'explique tout!', '#code', '#benjamincode', '#freetube', '#explore', '', '#saas', '', '', '', '', 'freetube', 706, 1, 10069, 1, '2024-08-11 23:25:51', 1);

--
-- Déclencheurs `videos`
--
DELIMITER $$
CREATE TRIGGER `channel_comments` AFTER UPDATE ON `videos` FOR EACH ROW BEGIN
    UPDATE utilisateurs
    SET u_t_commentaires = (
        SELECT SUM(v_t_commentaires)
        FROM videos
        WHERE v_auth_fk = NEW.v_auth_fk
    )
    WHERE u_ftb_nom = NEW.v_auth_fk;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `channel_jaimes` AFTER UPDATE ON `videos` FOR EACH ROW BEGIN
    UPDATE utilisateurs
    SET u_t_jaimes = (
        SELECT SUM(v_t_jaimes)
        FROM videos
        WHERE v_auth_fk = NEW.v_auth_fk
    )
    WHERE u_ftb_nom = NEW.v_auth_fk;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `channel_vues` AFTER UPDATE ON `videos` FOR EACH ROW BEGIN
    UPDATE utilisateurs
    SET u_t_vues = (
        SELECT SUM(v_t_vues)
        FROM videos
        WHERE v_auth_fk = NEW.v_auth_fk
    )
    WHERE u_ftb_nom = NEW.v_auth_fk;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_vtags` AFTER INSERT ON `videos` FOR EACH ROW BEGIN
    DECLARE tag VARCHAR(20);
    SET tag = NEW.v_tag1;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag2;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag3;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag4;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag5;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag6;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag7;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag8;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag9;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag10;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_vtags_2` AFTER UPDATE ON `videos` FOR EACH ROW BEGIN
    DECLARE tag VARCHAR(20);
    SET tag = NEW.v_tag1;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag2;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag3;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag4;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag5;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag6;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag7;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag8;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag9;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
    SET tag = NEW.v_tag10;
    IF tag != '' THEN
        INSERT INTO vtags (vt_nom, vt_t) VALUES (tag, 1)
        ON DUPLICATE KEY UPDATE vt_t = vt_t + 1;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `vtags`
--

CREATE TABLE `vtags` (
  `vt_id` int(11) NOT NULL,
  `vt_nom` varchar(20) NOT NULL,
  `vt_t` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `vtags`
--

INSERT INTO `vtags` (`vt_id`, `vt_nom`, `vt_t`) VALUES
(1, '#FreeTube', 608),
(2, '#Mestre', 107),
(3, '#Goth', 110),
(9, '#explore', 549),
(275, '#binkz', 165),
(276, '#vvs', 281),
(279, '#lebonheur', 116),
(285, '#code', 82),
(286, '#benjamincode', 82),
(289, '#saas', 82);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD PRIMARY KEY (`a_id`),
  ADD KEY `_createur` (`a_abo_fk`),
  ADD KEY `_abo` (`a_abonnement_fk`);

--
-- Index pour la table `catfreetube`
--
ALTER TABLE `catfreetube`
  ADD PRIMARY KEY (`c_cat_nom`),
  ADD KEY `_cat_nom_catfreetube` (`c_cat_nom`);

--
-- Index pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD PRIMARY KEY (`c_id`),
  ADD KEY `_c_videos_commentaires` (`c_video_id_fk`),
  ADD KEY `_c_auth_commentaires` (`c_auth_fk`),
  ADD KEY `_c_txt_commentaires` (`c_txt`);

--
-- Index pour la table `plalist_noms`
--
ALTER TABLE `plalist_noms`
  ADD PRIMARY KEY (`pn_id`),
  ADD KEY `_pn_nom` (`pn_nom`),
  ADD KEY `_pn_auth_fk` (`pn_auth_fk`);

--
-- Index pour la table `playlists`
--
ALTER TABLE `playlists`
  ADD PRIMARY KEY (`p_id`),
  ADD KEY `_p_pn_id_fk` (`p_pn_id_fk`),
  ADD KEY `_p_v_id_fk` (`p_v_id_fk`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`u_id`),
  ADD UNIQUE KEY `u_ftb_nom` (`u_ftb_nom`),
  ADD UNIQUE KEY `u_email` (`u_email`),
  ADD UNIQUE KEY `u_passwd` (`u_passwd`) USING HASH,
  ADD KEY `_ftb_utilisateurs` (`u_ftb_nom`),
  ADD KEY `_nom_utilisateurs` (`u_nom`(768)),
  ADD KEY `_prenom_utilisateurs` (`u_prenom`(768)),
  ADD KEY `_email_utiisateurs` (`u_email`),
  ADD KEY `_pwd_utilisateurs` (`u_passwd`(768)),
  ADD KEY `_pp_utilisateurs` (`u_pp`),
  ADD KEY `_description_utilisateurs` (`u_description`),
  ADD KEY `_commentaires_utilisateurs` (`u_t_commentaires`),
  ADD KEY `_jaimes_utilisateurs` (`u_t_jaimes`),
  ADD KEY `_followers_utilisateurs` (`u_t_abos`),
  ADD KEY `_age_utilisateurs` (`u_age`(768)),
  ADD KEY `_vues_utilisateurs` (`u_t_vues`);

--
-- Index pour la table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`v_id`),
  ADD KEY `_v_titre` (`v_titre`),
  ADD KEY `_v_auth_videos` (`v_auth_fk`),
  ADD KEY `_v_miniature_videos` (`v_miniature`(768)),
  ADD KEY `_v_videos__` (`v_video`(768)),
  ADD KEY `_v_description_videos` (`v_description`),
  ADD KEY `_v_tag1_videos` (`v_tag1`),
  ADD KEY `_v_tag2_videos` (`v_tag2`),
  ADD KEY `_v_tag3_videos` (`v_tag3`),
  ADD KEY `_v_tag4_videos` (`v_tag4`),
  ADD KEY `_v_tag5_videos` (`v_tag5`),
  ADD KEY `_v_tag6_videos` (`v_tag6`),
  ADD KEY `_v_tag7_videos` (`v_tag7`),
  ADD KEY `_v_tag8_videos` (`v_tag8`),
  ADD KEY `_v_tag9_videos` (`v_tag9`),
  ADD KEY `_v_tag10_videos` (`v_tag10`),
  ADD KEY `_v_categorie` (`v_categorie_fk`),
  ADD KEY `_v_jaimes` (`v_t_jaimes`),
  ADD KEY `_v_commentes` (`v_t_commentaires`),
  ADD KEY `_v_vues` (`v_t_vues`),
  ADD KEY `_v_statut` (`v_statut`),
  ADD KEY `_v_majeur` (`v_majeur`),
  ADD KEY `_v_date` (`v_DATE`);

--
-- Index pour la table `vtags`
--
ALTER TABLE `vtags`
  ADD PRIMARY KEY (`vt_id`),
  ADD UNIQUE KEY `vt_nom` (`vt_nom`),
  ADD KEY `_vt_nom` (`vt_nom`),
  ADD KEY `_vt_t` (`vt_t`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `abonnements`
--
ALTER TABLE `abonnements`
  MODIFY `a_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `commentaires`
--
ALTER TABLE `commentaires`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `plalist_noms`
--
ALTER TABLE `plalist_noms`
  MODIFY `pn_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT pour la table `playlists`
--
ALTER TABLE `playlists`
  MODIFY `p_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `videos`
--
ALTER TABLE `videos`
  MODIFY `v_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `vtags`
--
ALTER TABLE `vtags`
  MODIFY `vt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2183;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD CONSTRAINT `abonnements_ibfk_1` FOREIGN KEY (`a_abo_fk`) REFERENCES `utilisateurs` (`u_ftb_nom`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `abonnements_ibfk_2` FOREIGN KEY (`a_abonnement_fk`) REFERENCES `utilisateurs` (`u_ftb_nom`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD CONSTRAINT `commentaires_ibfk_1` FOREIGN KEY (`c_auth_fk`) REFERENCES `utilisateurs` (`u_ftb_nom`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `commentaires_ibfk_2` FOREIGN KEY (`c_video_id_fk`) REFERENCES `videos` (`v_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `plalist_noms`
--
ALTER TABLE `plalist_noms`
  ADD CONSTRAINT `plalist_noms_ibfk_1` FOREIGN KEY (`pn_auth_fk`) REFERENCES `utilisateurs` (`u_ftb_nom`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `playlists`
--
ALTER TABLE `playlists`
  ADD CONSTRAINT `playlists_ibfk_1` FOREIGN KEY (`p_pn_id_fk`) REFERENCES `plalist_noms` (`pn_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `playlists_ibfk_2` FOREIGN KEY (`p_v_id_fk`) REFERENCES `videos` (`v_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `videos`
--
ALTER TABLE `videos`
  ADD CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`v_auth_fk`) REFERENCES `utilisateurs` (`u_ftb_nom`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `videos_ibfk_2` FOREIGN KEY (`v_categorie_fk`) REFERENCES `catfreetube` (`c_cat_nom`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
