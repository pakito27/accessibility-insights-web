// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface ClientBrowserAdapter {
    addListenerOnConnect(callback: (port: chrome.runtime.Port) => void): void;
    addListenerOnMessage(
        callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void,
    ): void;

    removeListenerOnMessage(
        callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void,
    ): void;
    connect(connectionInfo?: chrome.runtime.ConnectInfo): chrome.runtime.Port;
    sendMessageToFrames(message: any): void;
    getManifest(): chrome.runtime.Manifest;
    extensionVersion: string;

    getUrl(urlPart: string): string;
}

export class ClientChromeAdapter implements ClientBrowserAdapter {
    public addListenerOnConnect(callback: (port: chrome.runtime.Port) => void): void {
        chrome.runtime.onConnect.addListener(callback);
    }

    public addListenerOnMessage(
        callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void,
    ): void {
        //chrome.runtime.onMessage.addListener(callback);
    }

    public removeListenerOnMessage(
        callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void,
    ): void {
        chrome.runtime.onMessage.removeListener(callback);
    }

    public connect(connectionInfo?: chrome.runtime.ConnectInfo): chrome.runtime.Port {
        return chrome.runtime.connect(chrome.runtime.id, connectionInfo);
    }

    public getManifest(): chrome.runtime.Manifest {
        return JSON.parse(
            `{"background":{"page":"background/background.html"},"browser_action":{"default_popup":"popup/popup.html"},"commands":{"01_toggle-issues":{"description":"Toggle Automated checks","suggested_key":{"chromeos":"Ctrl+Shift+1","linux":"Ctrl+Shift+1","mac":"Command+Shift+1","windows":"Ctrl+Shift+1"}},"02_toggle-landmarks":{"description":"Toggle Landmarks","suggested_key":{"chromeos":"Ctrl+Shift+2","linux":"Ctrl+Shift+2","mac":"Command+Shift+2","windows":"Ctrl+Shift+2"}},"03_toggle-headings":{"description":"Toggle Headings","suggested_key":{"chromeos":"Ctrl+Shift+3","linux":"Ctrl+Shift+3","mac":"Command+Shift+3","windows":"Ctrl+Shift+3"}},"04_toggle-tabStops":{"description":"Toggle Tab stops"},"05_toggle-color":{"description":"Toggle Color"},"_execute_browser_action":{"description":"Activate the extension","suggested_key":{"chromeos":"Ctrl+Shift+K","linux":"Ctrl+Shift+K","mac":"Command+Shift+K","windows":"Ctrl+Shift+K"}}},"content_security_policy":"script-src 'self' 'unsafe-eval' https://az416426.vo.msecnd.net; object-src 'self'","description":"Accessibility Insights for Web helps developers quickly find and fix accessibility issues.","devtools_page":"devtools/devtools.html","icons":{"16":"icons/brand/blue/brand-blue-16px.png","48":"icons/brand/blue/brand-blue-48px.png","128":"icons/brand/blue/brand-blue-128px.png"},"key":"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs88BPdeATfZMpEmyioaG2gS8OXpcEYKTnfriDiOPrHApjiMOrbiMU2cFZsbxqKpBMktKrmOa6PRq328H6N4QN42p2c9eGdY1Mgun9UAQFV1EQWsUelAWzKeZRMRPWVBTnMHVRIHe7p9cXoHCTRB0kIbqR+P7zhxaf2bCaaiQ/UUMeX7LFLDoXNCmuFOnjLLupkNgJJdPIDCHpEypwQCpNNUH4UsOxJ0yTfAplYdw7cc7ZwSh/BJqAWRplywkXwRrL5FeFfXknIi/tMZzxYv4ZM89CY5ogPr1JZMVA5sw0xW0oh81wLHa6Y47mmPXgMtzyNKZ/QJRP6b66uNuot+FXQIDAQAB","manifest_version":2,"name":"Accessibility Insights for Web","permissions":["storage","webNavigation","tabs","notifications","https://*/*","http://*/*","file://*/*"],"update_url":"https://clients2.google.com/service/update2/crx","version":"2.1.2","web_accessible_resources":["insights.html","assessments/*","injected/*","background/*","common/*","DetailsView/*"]}`,
        ) as any;
    }

    public get extensionVersion(): string {
        return this.getManifest().version;
    }

    public sendMessageToFrames(message: any): void {
        chrome.runtime.sendMessage(message);
    }

    public getUrl(urlPart: string): string {
        return chrome.extension.getURL(urlPart);
    }
}
