export const en = {
    home: {
        empty: 'No documents yet',
        emptyDesc: 'Tap the scan button to add your first document.',
    },
    validation: {
        required: 'This field is required',
        invalidEmail: 'Invalid email address',
        passwordMin: 'Password must be at least 6 characters',
        nameMin: 'Name must be at least 2 characters',
    },
    auth: {
        login: {
            title: 'Klipp',
            subtitle: 'Access your account',
            emailLabel: 'Email',
            emailPlaceholder: 'hello@example.com',
            passwordLabel: 'Password',
            passwordPlaceholder: '********',
            submitButton: 'Sign In',
            loading: 'Signing in...',
            footerText: "Don't have an account?",
            footerLink: 'Sign Up',
            errorGeneric: 'Login failed. Please check your credentials.',
        },
        signup: {
            title: 'Create Account',
            subtitle: 'Sign up to get started',
            nameLabel: 'Name',
            namePlaceholder: 'John Doe',
            emailLabel: 'Email',
            emailPlaceholder: 'hello@example.com',
            passwordLabel: 'Password',
            passwordPlaceholder: '********',
            submitButton: 'Sign Up',
            loading: 'Creating account...',
            footerText: 'Already have an account?',
            footerLink: 'Sign In',
            errorGeneric: 'Registration failed. Please try again.',
        },
        validation: {
            required: 'Required',
            emailInvalid: 'Invalid email address',
            passwordMin: 'Password must be at least 6 characters',
            nameMin: 'Name must be at least 2 characters',
        }
    },
    common: {
        search: "Search",
        appName: 'Klipp',
        actions: {
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            back: 'Back',
            ok: 'OK',
            success: 'Success',
            saved: 'Saved successfully',
            change_file: 'Change File',
            add_new_file: 'Add New File',
            upgrade: 'Upgrade',
            grant_permission: 'Grant Permission',
        },
        units: {
            day: 'Day',
            month: 'Month',
            year: 'Year',
        },
        months: {
            january: 'January',
            february: 'February',
            march: 'March',
            april: 'April',
            may: 'May',
            june: 'June',
            july: 'July',
            august: 'August',
            september: 'September',
            october: 'October',
            november: 'November',
            december: 'December',
        },
        error: 'Error',
    },
    receipts: {
        home: {
            emptyTitle: 'No receipts yet',
            emptySubtitle: 'Tap the blue + button to scan your first receipt.',
            welcome: 'Welcome back,',
            myProfile: 'My Profile',
            title: 'My Attachments',
            empty: 'No attachments found',
            date: 'Date',
            description: 'Description',
            read_more: 'Read more',
            sections: {
                details: 'Details',
                general: 'General Info',
            },
            searchPlaceholder: 'Search',
            filter: 'Filter',
            retry: 'Retry',
            error_load: 'Failed to load attachments',
        },
        detail: {
            title: 'Document Details',
            amount: 'Amount',
            date: 'Date',
            description: 'Description',
            read_more: 'Read more',
            sections: {
                details: 'Details',
                general: 'General Info',
            },
            fields: {
                document_date: 'Document Date',
                created_at: 'Added Date',
                currency: 'Currency',
            },
            actions: {
                share: 'Share',
                edit: 'Edit',
                delete: 'Delete',
                cancel: 'Cancel',
                menu_title: 'Document Actions',
                delete_title: 'Delete Document',
                delete_message: 'Are you sure you want to delete this document? This cannot be undone.',
                delete_success: 'Document deleted',
                open_hint: 'Tap to open',
                no_file: 'No file',
                error_load: 'Failed to load document',
                error_delete: 'Failed to delete document',
                error_save: 'Failed to save changes', // Added
                error_permission: 'You do not have permission', // Added
                coming_soon: 'Editing will be available soon.',
            }
        },
        scan: {
            title: 'Scan Document',
            pickImage: 'Pick Image',
            takePhoto: 'Take Photo',
            noImage: 'No Image Selected',
            detailsTitle: 'Details',
            titlePlaceholder: 'Title (e.g. Grocery Store)',
            amountPlaceholder: 'Amount',
            saveButton: 'Save Document',
            saving: 'Saving...',
            errorImage: 'Please select or take a photo of the document.',
            errorFields: 'Please fill in the title and amount.',
            successTitle: 'Success',
            successMessage: 'Document created successfully!',
            errorTitle: 'Error',
            errorMessage: 'Failed to create document.',
            permissionCamera: 'Camera permission is required to take photos.',
            permissionTitle: 'Permission Required',
            method_subtitle: 'Choose a method to add document',
            scan_method: {
                title: 'Scan Document',
                desc: 'Recommended for receipts and invoices'
            },
            camera_method: {
                title: 'Take Photo',
                desc: 'For quick capture'
            },
            gallery_method: {
                title: 'Select from Gallery',
                desc: 'Use existing photos'
            },
            file_method: {
                title: 'Select File',
                desc: 'PDF, Word, Excel files'
            },
            methods: {
                camera: 'Camera',
                gallery: 'Gallery',
                document: 'Files',
            },
            analyzing: {
                title: 'Analyzing document...',
                desc: 'Extracting text and details'
            },
            back: '← Back',
            edit_details: 'Edit Details',
            tap_to_change: 'Tap to change',
            currency_label: 'Unit',
            currency_select_label: 'Currency',
            document_date: 'Document Date',
            default_document_name: 'Document',
            validation: {
                title_required: 'Title is required',
                type_required: 'Select document type',
                folder_required: 'Select folder'
            },
            folder_select_label: 'Select Folder', // Added
            type_select_label: 'Document Type',   // Added
            custom_fields_title: 'Custom Fields', // Added
            add_custom_field: 'Add Field',
            custom_key_placeholder: 'Field Name', // Added
            custom_value_placeholder: 'Value',    // Added
            details_section_title: 'Document Details',
            section: {
                general: 'General Info',
                extra: 'Extra Info',
                custom_fields: 'Custom Fields',
            },
            custom_fields: {
                key_placeholder: 'Field name',
                value_placeholder: 'Value',
                add_button: '+ Add Field',
                expand_hint: 'Tap above to add extra info like warranty duration, serial number',
            },
            ocr_unavailable_short: 'Text recognition not available',
            ocr_not_available: {
                title: 'Scanner Not Available',
                message: 'This feature does not work in Expo Go. Please use "Take Photo" or "Select from Gallery".'
            },
            document_scan_error: {
                title: 'Error',
                message: 'Document scan failed. Please try normal camera.'
            },
            file_pick_error: {
                title: 'Error',
                message: 'Could not select file'
            },
            file_required: {
                title: 'Error',
                message: 'Please attach a file'
            },
            save_success: {
                title: 'Success',
                message: 'Document saved'
            },
            save_error: {
                title: 'Error',
                message: 'Could not save document'
            }
        },
        card: {
            date: 'Date: %{date}',
        }
    },
    folders: {
        title: 'Folders',
        subtitle: 'Organize your receipts into folders.',
        create: 'Create New Folder',
        empty: 'No folders yet',
        namePlaceholder: 'Folder Name',
        save: 'Create',
        cancel: 'Cancel',
        picker: {
            placeholder: 'Select Folder',
            modal_title: 'Select Folder',
            search_placeholder: 'Search folders...',
            back: 'Selection',
            root: 'Root',
            empty: 'No folders found',
            empty_type: 'No document types found',
            search_type: 'Search document types...',
            all: 'All',
            shared_badge: 'Shared',
            permissions: {
                view: 'View',
                edit: 'Edit'
            }
        },
        default_name: 'Folder',
        shared_with_me: 'Shared with Me',
        my_folders: 'My Folders',
        section: {
            contents: 'Contents',
        },
        stats: {
            subfolder: 'subfolder',
            document: 'document',
        },
        sharing: {
            title: 'Sharing',
            person_count: 'people',
            person_count_one: 'person',
            pending_count: 'pending',
            empty: 'Not shared with anyone yet',
            add_person: 'Add Person',
            shared_with_you: 'Shared with you',
            tabs: {
                all: 'All',
                pending: 'Pending',
                accepted: 'Accepted'
            },
            roles: {
                viewer: 'Viewer',
                editor: 'Editor',
                create: 'Create',
                full: 'Full Access',
                viewer_desc: 'Can only view',
                editor_desc: 'Can view and edit',
                create_desc: 'Can view, edit, and add',
                full_desc: 'Full access including delete',
            },
            actions: {
                remove_access: 'Remove Access',
                remove_title: 'Remove Access',
                remove_message: 'Are you sure you want to remove access for {name}?',
                remove_error: 'Failed to remove access',
                update_error: 'Failed to update permission',
            },
            edit_title: 'Edit Share',
            permission_label: 'Permission Level',
            status: {
                pending: 'Pending',
            },
        },
        detail_empty: {
            title: 'This folder is empty',
            desc: 'Tap + button to add subfolder or document',
        },
        shared: 'Shared'
    },
    sharing: {
        modal: {
            title: 'Share Folder',
            cancel: 'Cancel',
            success: 'Shared successfully!',
            search_title: 'Search User',
            search_placeholder: 'Enter full email address',
            search_button: 'Search',
            search_hint: 'Enter the email address of the person you want to share with',
            no_result: 'No user found with this email',
            permission_level: 'Permission Level',
            roles: {
                viewer: 'Viewer',
                editor: 'Editor',
                create: 'Create',
                full: 'Full Access',
            },
            share_button: 'Share',
            error_email: 'Please enter a valid email',
            error_select_user: 'Please select a user',
            error_generic: 'Sharing failed'
        }
    },
    filters: {
        title: 'Filters',
        reset: 'Reset',
        apply: 'Apply Filters',
        sections: {
            folder: 'Folder',
            folder_placeholder: 'Select folder',
            document_type: 'Document Type',
            type_placeholder: 'Select type',
            type_title: 'Select Document Type',
            currency: 'Currency',
            amount_range: 'Amount Range',
            date_range: 'Document Date',
        },
        placeholders: {
            min: 'Min',
            max: 'Max',
            start: 'Start',
            end: 'End',
        }
    },
    attachment_card: {
        expired: 'Expired',
        expires_today: 'Expires today',
        days_left: '{{count}} days left',
        months_left: '~{{count}} months left',
        months_left_exact: '{{count}} months left',
        years_months_left: '{{years}} years {{months}} months',
        years_left: '{{count}} years left',
    },
    notification: {
        attachment_created: {
            title: 'New Attachment Added',
            body: '{{actorName}} added "{{attachmentTitle}}" to "{{folderName}}"',
        },
        attachment_updated: {
            title: 'Attachment Updated',
            body: '{{actorName}} updated "{{attachmentTitle}}" in "{{folderName}}"',
        },
        attachment_deleted: {
            title: 'Attachment Deleted',
            body: '{{actorName}} deleted "{{attachmentTitle}}" from "{{folderName}}"',
        },
        folder_share_invite: {
            title: 'Folder Share Invitation',
            body: '{{sharedByName}} shared "{{folderName}}" with you ({{permission}})',
        },
        folder_share_accepted: {
            title: 'Share Accepted',
            body: '{{respondedByName}} accepted share for "{{folderName}}"',
        },
        folder_share_rejected: {
            title: 'Share Rejected',
            body: '{{respondedByName}} rejected share for "{{folderName}}"',
        },
    },
    profile: {
        title: 'Profile',
        name: 'User',
        email: 'user@example.com',
        settings: {
            general: 'General',
            sharing: 'Sharing',
            notifications: 'Notifications',
            notificationSubtitle: 'Receive push notifications',
            notificationsRead: '%{count} unread',
            notificationsAllRead: 'All notifications read',
            sharedWithMe: 'Shared With Me',
            sharedPending: '%{count} pending invitation',
            sharedSubtitle: 'Shared folders',
            language: 'Language',
            theme: 'Theme',
            storage: 'Data & Storage',
            backup: 'Backup',
            backupSubtitle: 'Auto backup',
            export: 'Export Data',
            support: 'Support',
            help: 'Help Center',
            contact: 'Contact Us',
            rate: 'Rate App',
            account: 'Account',
            logout: 'Log Out',
            deleteAccount: 'Delete Account',
            logoutConfirmTitle: 'Log Out',
            logoutConfirmMessage: 'Are you sure you want to log out?',
            deleteConfirmTitle: 'Delete Account',
            deleteConfirmMessage: 'This action cannot be undone. All your data will be deleted. Do you want to continue?',
            cancel: 'Cancel',
            soon: 'This feature will be added soon.',
            themes: {
                system: 'System',
                light: 'Light',
                dark: 'Dark'
            },
            languages: {
                tr: 'Türkçe',
                en: 'English'
            },
            web: 'WEB',
            webLogin: 'Web Login',
            webLoginSubtitle: 'Scan QR code in browser',
            webLoginUrl: 'Web Login URL',
            urlCopied: 'URL Copied',
            activeSessions: 'Active Sessions',
        }
    },
    scan_qr: {
        title: 'Web Login',
        permission_message: 'We need camera permission to scan QR code.',
        success_message: 'Web session authorized successfully.',
        error_message: 'Invalid or expired code.',
        connection_error: 'Connection error occurred.',
        processing: 'Logging in...',
        instruction: 'Scan the QR code on your computer',
    },
    web_sessions: {
        title: 'Web Sessions',
        revoke_title: 'Revoke Session',
        revoke_confirm: 'Are you sure you want to log out this device?',
        revoke_all_title: 'Revoke All',
        revoke_all_confirm: 'Are you sure you want to log out all devices?',
    },
    attachmentTypes: {
        invoice: 'Invoice',
        receipt: 'Receipt',
        payment_receipt: 'Payment Receipt',
        warranty: 'Warranty Document',
        check: 'Check',
        bank_slip: 'Bank Slip',
        contract: 'Contract',
        certificate: 'Certificate',
        insurance: 'Insurance Policy',
        license: 'License',
        subscription: 'Subscription',
        bill: 'Bill',
        ticket: 'Ticket',
        prescription: 'Prescription',
        medical_report: 'Medical Report',
        tax_document: 'Tax Document',
        bank_statement: 'Bank Statement',
        deed: 'Deed',
        vehicle_document: 'Vehicle Document',
        passport: 'Passport',
        id_card: 'ID Card',
        diploma: 'Diploma',
        membership_card: 'Membership Card',
        other: 'Other'
    },
    subscription: {
        title: 'Subscription Plans',
        subtitle: 'Choose a plan to continue',
        features: {
            unlimited: 'Unlimited Documents',
            cloud: 'Secure Cloud Backup',
            export: 'Bulk Export',
            search: 'Advanced Search',
            no_ads: 'Ad-Free Experience',
        },
        plans: {
            monthly: 'Monthly',
            yearly: 'Yearly',
            save_percent: 'Save 20%',
            cancel_anytime: 'Cancel anytime',
        },
        actions: {
            subscribe: 'Subscribe Now',
            restore: 'Restore Purchases',
            terms: 'Terms of Use',
            privacy: 'Privacy Policy',
        },
        success: {
            title: 'Thank you!',
            message: 'Your Premium subscription is now active.',
        },
        error: {
            title: 'Error',
            message: 'Purchase failed.',
        },
        status: {
            free_plan: 'Free Plan (Not Subscribed)',
            premium_plan: 'Premium Plan',
        }
    }
};
