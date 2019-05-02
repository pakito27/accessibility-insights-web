import { OpenDialogOptions } from 'electron';
import { remote } from 'electron-renderer';
import { readFileSync } from 'fs';
import { get } from 'http';
import { values } from 'lodash';

export class AndroidResultsBridge {
    public static GetAxeResults(cb): void {
        get('http://localhost:48485/axe/result', resp => {
            let data = '';

            resp.on('data', chunk => {
                data += chunk;
            });

            resp.on('end', () => {
                cb(data);
            });
        }).on('error', err => {
            console.log('Error: ' + err.message);
        });
    }

    public static OpenFilePicker(): string {
        const dialog = remote.dialog;
        const WIN = remote.getCurrentWindow();

        const options: OpenDialogOptions = {
            title: 'Open Android Results File',
            buttonLabel: 'Select',
            filters: [{ name: 'JSON', extensions: ['json'] }, { name: 'All Files', extensions: ['*'] }],
            properties: ['openFile'],
        };

        const filePath = dialog.showOpenDialog(WIN, options);

        if (filePath.length > 0) {
            return filePath[0];
        }

        return null;
    }

    public static ReadAndroidFile(filepath: string): any {
        const file = readFileSync(filepath);
        const filestr = file.toString();
        return JSON.parse(filestr);
    }

    public static AndroidToWebResults(androidResults): any {
        const results = {};
        const parser = res => {
            if (res.status !== 'FAIL') return;

            if (!(res.ruleId in results)) {
                results[res.ruleId] = {
                    id: res.ruleId,
                    impact: 'serious',
                    tags: ['cat.name-role-value', 'wcag2a', 'wcag412'],
                    description: res.ruleSummary,
                    help: res.ruleSummary,
                    helpUrl: '',
                    nodes: [],
                    guidanceLinks: [],
                };
            }
            const newRes = {
                any: [],
                all: [
                    {
                        id: res.ruleId,
                        data: null,
                        relatedNodes: [],
                        impact: 'serious',
                        message: res.ruleSummary,
                    },
                ],
                none: [],
                impact: 'serious',
                html: '',
                target: [`${res.props.className} ${res.axeViewId}`],
                failureSummary: res.ruleId,
                instanceId: res.axeViewId,
                selector: `${res.props.className} ${res.axeViewId}`,
                key: res.axeViewId,
            };

            results[res.ruleId].nodes.push(newRes);
        };

        androidResults.axeRuleResults.forEach(parser);
        return values(results);
    }
}
