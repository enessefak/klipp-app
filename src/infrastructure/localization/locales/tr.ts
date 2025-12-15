export const tr = {
    home: {
        empty: 'Henüz belge yok',
        emptyDesc: 'İlk belgenizi eklemek için tarama butonuna dokunun.',
    },
    validation: {
        required: 'Bu alan zorunludur',
        invalidEmail: 'Geçersiz e-posta adresi',
        passwordMin: 'Şifre en az 6 karakter olmalı',
        nameMin: 'İsim en az 2 karakter olmalı',
    },
    auth: {
        login: {
            title: 'Klipp',
            subtitle: 'Hesabına hemen eriş',
            emailLabel: 'E-posta',
            emailPlaceholder: 'merhaba@ornek.com',
            passwordLabel: 'Şifre',
            passwordPlaceholder: '********',
            submitButton: 'Giriş Yap',
            loading: 'Giriş yapılıyor...',
            footerText: "Hesabınız yok mu?",
            footerLink: 'Kaydol',
            errorGeneric: 'Giriş başarısız. Bilgilerinizi kontrol edin.',
        },
        signup: {
            title: 'Hesap Oluştur',
            subtitle: 'Başlamak için kaydolun',
            nameLabel: 'İsim',
            namePlaceholder: 'Ad Soyad',
            emailLabel: 'E-posta',
            emailPlaceholder: 'merhaba@ornek.com',
            passwordLabel: 'Şifre',
            passwordPlaceholder: '********',
            submitButton: 'Kaydol',
            loading: 'Hesap oluşturuluyor...',
            footerText: 'Zaten hesabınız var mı?',
            footerLink: 'Giriş Yap',
            errorGeneric: 'Kayıt başarısız. Lütfen tekrar deneyin.',
        },
        validation: {
            required: 'Zorunlu',
            emailInvalid: 'Geçersiz e-posta adresi',
            passwordMin: 'Şifre en az 6 karakter olmalı',
            nameMin: 'İsim en az 2 karakter olmalı',
        }
    },
    common: {
        appName: 'Klipp',
        actions: {
            cancel: 'İptal',
            save: 'Kaydet',
            delete: 'Sil',
            edit: 'Düzenle',
            back: 'Geri',
            ok: 'Tamam',
            success: 'Başarılı',
            saved: 'Başarıyla kaydedildi',
            change_file: 'Dosyayı Değiştir',
            add_new_file: 'Yeni Dosya Ekle',
            upgrade: 'Yükselt',
            grant_permission: 'İzin Ver',
        },
        units: {
            day: 'Gün',
            month: 'Ay',
            year: 'Yıl',
        },
        months: {
            january: 'Ocak',
            february: 'Şubat',
            march: 'Mart',
            april: 'Nisan',
            may: 'Mayıs',
            june: 'Haziran',
            july: 'Temmuz',
            august: 'Ağustos',
            september: 'Eylül',
            october: 'Ekim',
            november: 'Kasım',
            december: 'Aralık',
        },
        error: 'Hata',
    },
    receipts: {
        home: {
            emptyTitle: 'Henüz fiş yok',
            emptySubtitle: 'İlk belgenizi taramak için mavi + butonuna basın.',
            welcome: 'Tekrar hoşgeldin,',
            myProfile: 'Profilim',
            title: 'Belgelerim',
            searchPlaceholder: 'Ara',
            filter: 'Filtrele',
            retry: 'Tekrar Dene',
            error_load: 'Belgeler yüklenemedi',
            empty: 'Belge bulunamadı',
            date: 'Tarih',
            description: 'Açıklama',
            read_more: 'Devamını oku',
            sections: {
                details: 'Detaylar',
                general: 'Genel Bilgiler',
            },
        },
        detail: {
            title: 'Belge Detayı',
            amount: 'Tutar',
            date: 'Tarih',
            description: 'Açıklama',
            read_more: 'Devamını oku',
            sections: {
                details: 'Detaylar',
                files: 'Dosyalar',
                general: 'Genel Bilgiler',
            },
            fields: {
                document_date: 'Belge Tarihi',
                created_at: 'Eklenme Tarihi',
                currency: 'Para Birimi',
            },
            actions: {
                share: 'Paylaş',
                edit: 'Düzenle',
                delete: 'Sil',
                cancel: 'İptal',
                menu_title: 'Belge İşlemleri',
                delete_title: 'Belgeyi Sil',
                delete_message: 'Bu belgeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
                delete_success: 'Belge silindi',
                open_hint: 'Açmak için dokunun',
                no_file: 'Dosya yok',
                error_load: 'Belge yüklenemedi',
                error_delete: 'Belge silinemedi',
                error_save: 'Değişiklikler kaydedilemedi',
                error_permission: 'Bu işlem için yetkiniz yok',
                coming_soon: 'Düzenleme özelliği yakında eklenecek.',
            }
        },
        scan: {
            title: 'Belge Ekle',
            pickImage: 'Resim Seç',
            takePhoto: 'Fotoğraf Çek',
            noImage: 'Resim Seçilmedi',
            detailsTitle: 'Detaylar',
            titlePlaceholder: 'Başlık (örn. Market)',
            amountPlaceholder: 'Tutar',
            saveButton: 'Fişi Kaydet',
            saving: 'Kaydediliyor...',
            errorImage: 'Lütfen bir fiş resmi seçin veya çekin.',
            errorFields: 'Lütfen başlık ve tutarı doldurun.',
            successTitle: 'Başarılı',
            successMessage: 'Fiş başarıyla oluşturuldu!',
            errorTitle: 'Hata',
            errorMessage: 'Fiş oluşturulamadı.',
            permissionTitle: 'İzin Gerekli',
            permissionCamera: 'Fotoğraf çekmek için kamera izni gerekiyor.',
            method_subtitle: 'Belge eklemek için bir yöntem seçin',
            scan_method: {
                title: 'Belge Tara',
                desc: 'Fiş ve faturalar için önerilir'
            },
            camera_method: {
                title: 'Fotoğraf Çek',
                desc: 'Hızlı çekim için'
            },
            gallery_method: {
                title: 'Galeriden Seç',
                desc: 'Mevcut fotoğrafları kullan'
            },
            file_method: {
                title: 'Dosya Seç',
                desc: 'PDF, Word, Excel dosyaları'
            },
            methods: {
                camera: 'Kamera',
                gallery: 'Galeri',
                document: 'Dosyalar',
            },
            analyzing: {
                title: 'Belge analiz ediliyor...',
                desc: 'Metin ve bilgiler çıkarılıyor'
            },
            back: '← Geri',
            edit_details: 'Detayları Düzenle',
            tap_to_change: 'Değiştirmek için dokun',
            currency_label: 'Birim',
            currency_select_label: 'Para Birimi',
            document_date: 'Belge Tarihi',
            default_document_name: 'Belge',
            validation: {
                title_required: 'Başlık zorunludur',
                type_required: 'Belge tipi seçin',
                folder_required: 'Klasör seçin'
            },
            folder_select_label: 'Klasör Seç',
            type_select_label: 'Belge Tipi',
            custom_fields_title: 'Özel Alanlar',
            add_custom_field: 'Alan Ekle',
            custom_key_placeholder: 'Alan Adı',
            custom_value_placeholder: 'Değer',
            details_section_title: 'Belge Detayları',
            section: {
                general: 'Genel Bilgiler',
                extra: 'Ek Bilgiler',
                custom_fields: 'Özel Alanlar',
            },
            custom_fields: {
                key_placeholder: 'Alan adı',
                value_placeholder: 'Değer',
                add_button: 'Alan Ekle',
                expand_hint: 'Garanti süresi, seri no gibi ek bilgileri eklemek için yukarıya dokunun',
            },
            ocr_unavailable_short: 'Metin okuma özelliği kullanılamıyor',
            ocr_not_available: {
                title: 'Belge Tarayıcı Mevcut Değil',
                message: 'Bu özellik Expo Go\'da çalışmaz. Lütfen "Fotoğraf Çek" veya "Galeriden Seç" kullanın.'
            },
            document_scan_error: {
                title: 'Hata',
                message: 'Belge tarama başarısız oldu. Lütfen normal kamerayı deneyin.'
            },
            file_pick_error: {
                title: 'Hata',
                message: 'Dosya seçilemedi'
            },
            file_required: {
                title: 'Hata',
                message: 'Lütfen bir dosya ekleyin'
            },
            save_success: {
                title: 'Başarılı',
                message: 'Belge kaydedildi'
            },
            save_error: {
                title: 'Hata',
                message: 'Belge kaydedilemedi'
            }
        },
        card: {
            date: 'Tarih: %{date}',
        }
    },
    folders: {
        title: 'Klasörler',
        subtitle: 'Fişlerinizi klasörler içinde düzenleyin.',
        create: 'Yeni Klasör Oluştur',
        empty: 'Henüz klasör yok',
        namePlaceholder: 'Klasör Adı',
        save: 'Oluştur',
        cancel: 'İptal',
        picker: {
            placeholder: 'Klasör Seçin',
            modal_title: 'Klasör Seç',
            search_placeholder: 'Klasör ara...',
            back: 'Seçim',
            root: 'Ana Dizin',
            empty: 'Klasör bulunamadı',
            empty_type: 'Belge tipi bulunamadı',
            search_type: 'Belge tipi ara...',
            all: 'Tümü',
            shared_badge: 'Paylaşılan',
            permissions: {
                view: 'Görüntüle',
                edit: 'Düzenle'
            }
        },
        default_name: 'Klasör',
        shared_with_me: 'Benimle Paylaşılanlar',
        my_folders: 'Klasörlerim',
        section: {
            contents: 'İçerik',
        },
        stats: {
            subfolder: 'alt klasör',
            document: 'belge',
        },
        sharing: {
            title: 'Paylaşım',
            person_count: 'kişi',
            person_count_one: 'kişi',
            pending_count: 'bekliyor',
            empty: 'Henüz kimseyle paylaşılmadı',
            add_person: 'Kişi Ekle',
            shared_with_you: 'Sizinle Paylaşılanlar',
            tabs: {
                all: 'Tümü',
                pending: 'Bekliyor',
                accepted: 'Kabul Edildi'
            },
            roles: {
                viewer: 'Görüntüleyen',
                editor: 'Düzenleyen',
                viewer_desc: 'Sadece görüntüleyebilir',
                editor_desc: 'Düzenleyebilir ve ekleyebilir',
            },
            actions: {
                remove_access: 'Erişimi Kaldır',
                remove_title: 'Erişimi Kaldır',
                remove_message: '{name} kullanıcısının erişimini kaldırmak istiyor musunuz?',
                remove_error: 'Erişim kaldırılamadı',
                update_error: 'Yetki güncellenemedi',
            },
            edit_title: 'Paylaşımı Düzenle',
            permission_label: 'Yetki Seviyesi',
            status: {
                pending: 'Bekliyor',
            },
        },
        detail_empty: {
            title: 'Bu klasör boş',
            desc: 'Alt klasör veya belge eklemek için + butonuna basın',
        },
        shared: 'Paylaşılan',
    },
    sharing: {
        modal: {
            title: 'Klasör Paylaş',
            cancel: 'İptal',
            success: 'Paylaşım başarılı!',
            search_title: 'Kullanıcı Ara',
            search_placeholder: 'Tam e-posta adresini girin',
            search_button: 'Ara',
            search_hint: 'Paylaşmak istediğiniz kişinin tam e-posta adresini girin',
            no_result: 'Bu e-posta adresine sahip kullanıcı bulunamadı',
            permission_level: 'İzin Seviyesi',
            roles: {
                viewer: 'Görüntüleyici',
                editor: 'Düzenleyici',
            },
            share_button: 'Paylaş',
            error_email: 'Geçerli bir e-posta adresi girin',
            error_select_user: 'Lütfen bir kullanıcı seçin',
            error_generic: 'Paylaşım başarısız oldu'
        }
    },
    filters: {
        title: 'Filtreler',
        reset: 'Sıfırla',
        apply: 'Filtreleri Uygula',
        sections: {
            folder: 'Klasör',
            folder_placeholder: 'Klasör seçin',
            document_type: 'Belge Tipi',
            type_placeholder: 'Belge tipi seçin',
            type_title: 'Belge Tipi Seçin',
            currency: 'Para Birimi',
            amount_range: 'Tutar Aralığı',
            date_range: 'Belge Tarihi',
        },
        placeholders: {
            min: 'Min',
            max: 'Max',
            start: 'Başlangıç',
            end: 'Bitiş',
        }
    },
    attachment_card: {
        expired: 'Süresi doldu',
        expires_today: 'Bugün doluyor',
        days_left: '{{count}} gün kaldı',
        months_left: '~{{count}} ay kaldı',
        months_left_exact: '{{count}} ay kaldı',
        years_months_left: '{{years}} yıl {{months}} ay',
        years_left: '{{count}} yıl kaldı',
    },
    notification: {
        attachment_created: {
            title: 'Yeni Ataş Eklendi',
            body: '{{actorName}}, "{{folderName}}" klasörüne "{{attachmentTitle}}" ekledi.',
        },
        attachment_updated: {
            title: 'Ataş Güncellendi',
            body: '{{actorName}}, "{{folderName}}" klasöründeki "{{attachmentTitle}}" öğesini güncelledi.',
        },
        attachment_deleted: {
            title: 'Ataş Silindi',
            body: '{{actorName}}, "{{folderName}}" klasöründen "{{attachmentTitle}}" öğesini sildi.',
        },
        folder_share_invite: {
            title: 'Klasör Paylaşım Daveti',
            body: '{{sharedByName}}, "{{folderName}}" klasörünü sizinle paylaştı ({{permission}} yetkisi)',
        },
        folder_share_accepted: {
            title: 'Paylaşım Kabul Edildi',
            body: '{{respondedByName}}, "{{folderName}}" klasör paylaşımını kabul etti',
        },
        folder_share_rejected: {
            title: 'Paylaşım Reddedildi',
            body: '{{respondedByName}}, "{{folderName}}" klasör paylaşımını reddetti',
        },
    },
    profile: {
        title: 'Profil',
        name: 'Kullanıcı',
        email: 'user@example.com',
        settings: {
            general: 'Genel',
            sharing: 'Paylaşım',
            notifications: 'Bildirimler',
            notificationSubtitle: 'Push bildirimleri al',
            notificationsRead: '%{count} okunmamış',
            notificationsAllRead: 'Tüm bildirimler okundu',
            sharedWithMe: 'Benimle Paylaşılanlar',
            sharedPending: '%{count} bekleyen davet',
            sharedSubtitle: 'Paylaşılan klasörler',
            language: 'Dil',
            theme: 'Tema',
            storage: 'Veri ve Depolama',
            backup: 'Yedekleme',
            backupSubtitle: 'Otomatik yedekleme',
            export: 'Verileri Dışa Aktar',
            support: 'Destek',
            help: 'Yardım Merkezi',
            contact: 'Bize Ulaşın',
            rate: 'Uygulamayı Değerlendir',
            account: 'Hesap',
            logout: 'Çıkış Yap',
            deleteAccount: 'Hesabı Sil',
            logoutConfirmTitle: 'Çıkış Yap',
            logoutConfirmMessage: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            deleteConfirmTitle: 'Hesabı Sil',
            deleteConfirmMessage: 'Bu işlem geri alınamaz. Tüm verileriniz silinecektir. Devam etmek istiyor musunuz?',
            cancel: 'İptal',
            soon: 'Bu özellik yakında eklenecek.',
            themes: {
                system: 'Sistem',
                light: 'Açık',
                dark: 'Koyu'
            },
            languages: {
                tr: 'Türkçe',
                en: 'English'
            },
            web_login: 'Web\'e Giriş Yap',
            web_sessions: 'Web Oturumları',
        }
    },
    scan_qr: {
        title: 'Web Giriş',
        permission_message: 'Web giriş için kamerayı kullanmamız gerekiyor.',
        success_message: 'Web oturumu başarıyla açıldı.',
        error_message: 'Geçersiz veya süresi dolmuş kod.',
        connection_error: 'Bağlantı hatası oluştu.',
        processing: 'Giriş yapılıyor...',
        instruction: 'Bilgisayarınızdaki QR kodu okutun',
    },
    web_sessions: {
        title: 'Web Oturumları',
        revoke_title: 'Oturumu Kapat',
        revoke_confirm: 'Bu cihazdan çıkış yapmak istediğinize emin misiniz?',
        revoke_all_title: 'Tüm Oturumları Kapat',
        revoke_all_confirm: 'Tüm web oturumlarını kapatmak istediğinize emin misiniz?',
    },
    attachmentTypes: {
        invoice: 'Fatura',
        receipt: 'Fiş',
        payment_receipt: 'Makbuz',
        warranty: 'Garanti Belgesi',
        check: 'Çek',
        bank_slip: 'Dekont',
        contract: 'Sözleşme',
        certificate: 'Sertifika',
        insurance: 'Sigorta Poliçesi',
        license: 'Lisans',
        subscription: 'Abonelik',
        bill: 'Fatura (Kamu)',
        ticket: 'Bilet',
        prescription: 'Reçete',
        medical_report: 'Tıbbi Rapor',
        tax_document: 'Vergi Belgesi',
        bank_statement: 'Banka Hesap Özeti',
        deed: 'Tapu',
        vehicle_document: 'Araç Belgesi',
        passport: 'Pasaport',
        id_card: 'Kimlik',
        diploma: 'Diploma',
        membership_card: 'Üyelik Kartı',
        other: 'Diğer'
    },
    subscription: {
        title: 'Abonelik Planları',
        subtitle: 'Devam etmek için bir plan seçin',
        features: {
            unlimited: 'Sınırsız Belge Tarama',
            cloud: 'Güvenli Bulut Yedekleme',
            export: 'Toplu Dışa Aktarma',
            search: 'Gelişmiş Arama',
            no_ads: 'Reklamsız Deneyim',
        },
        plans: {
            monthly: 'Aylık',
            yearly: 'Yıllık',
            save_percent: '%20 İndirim',
            cancel_anytime: 'İstediğin zaman iptal et',
        },
        actions: {
            subscribe: 'Abone Ol',
            restore: 'Satın Alımları Geri Yükle',
            terms: 'Kullanım Koşulları',
            privacy: 'Gizlilik Politikası',
        },
        success: {
            title: 'Teşekkürler!',
            message: 'Premium üyeliğiniz başarıyla başlatıldı.',
        },
        error: {
            title: 'Hata',
            message: 'Satın alma işlemi başarısız oldu.',
        },
        status: {
            free_plan: 'Ücretsiz Plan (Abone Değil)',
            premium_plan: 'Premium Plan',
        }
    }
};
