public with sharing class POEContactCredentialController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getProgramMetadata(String program) {
        Map<String, Object> result = new Map<String, Object>();

        // Define program-specific labels and field visibility
        Map<String, Map<String, String>> programLabels = new Map<String, Map<String, String>>{
            'directv' => new Map<String, String>{
                'usernameLabel' => 'Partner ID',
                'codeLabel' => 'Dealer Code',
                'activationDateLabel' => 'Activation Date'
            },
            'spectrum' => new Map<String, String>{
                'usernameLabel' => 'Username',
                'codeLabel' => 'Dealer ID',
                'activationDateLabel' => 'Activation Date'
            },
            'xfinity' => new Map<String, String>{
                'usernameLabel' => '', // No Username for Xfinity
                'codeLabel' => 'Partner ID',
                'activationDateLabel' => 'Activation Date'
            }
        };

        // Add program-specific labels to the result
        if (program != null && programLabels.containsKey(program.toLowerCase())) {
            result.put('labels', programLabels.get(program.toLowerCase()));
        } else {
            result.put('labels', new Map<String, String>{
                'usernameLabel' => 'Username',
                'codeLabel' => 'Code',
                'activationDateLabel' => 'Activation Date'
            });
        }

        // Add Process Status picklist options for Xfinity (or other programs)
        if (program != null && program.toLowerCase() == 'xfinity') {
            result.put('processStatusOptions', new List<String>{
                'Cancelled', 'In progress', 'New', 'Complete', 'Training Sent'
            });
        } else {
            result.put('processStatusOptions', new List<String>{
                'Cancelled', 'In progress', 'New', 'Complete'
            });
        }

        return result;
    }
}
