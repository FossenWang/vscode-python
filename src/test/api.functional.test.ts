// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { assert, expect } from 'chai';
import * as path from 'path';
import { instance, mock, when } from 'ts-mockito';
import { buildApi } from '../client/api';
import { ConfigurationService } from '../client/common/configuration/service';
import { EXTENSION_ROOT_DIR } from '../client/common/constants';
import { IConfigurationService, IDisposableRegistry } from '../client/common/types';
import { IEnvironmentVariablesProvider } from '../client/common/variables/types';
import { IInterpreterService } from '../client/interpreter/contracts';
import { InterpreterService } from '../client/interpreter/interpreterService';
import { ServiceContainer } from '../client/ioc/container';
import { ServiceManager } from '../client/ioc/serviceManager';
import { IServiceContainer, IServiceManager } from '../client/ioc/types';
import { IDiscoveryAPI } from '../client/pythonEnvironments/base/locator';

suite('Extension API', () => {
    const debuggerPath = path.join(EXTENSION_ROOT_DIR, 'pythonFiles', 'dispatch_debugpy');
    const debuggerHost = 'somehost';
    const debuggerPort = 12345;

    let serviceContainer: IServiceContainer;
    let serviceManager: IServiceManager;
    let configurationService: IConfigurationService;
    let interpreterService: IInterpreterService;
    let discoverAPI: IDiscoveryAPI;
    let environmentVariablesProvider: IEnvironmentVariablesProvider;

    setup(() => {
        serviceContainer = mock(ServiceContainer);
        serviceManager = mock(ServiceManager);
        configurationService = mock(ConfigurationService);
        interpreterService = mock(InterpreterService);
        environmentVariablesProvider = mock<IEnvironmentVariablesProvider>();
        discoverAPI = mock<IDiscoveryAPI>();

        when(serviceContainer.get<IConfigurationService>(IConfigurationService)).thenReturn(
            instance(configurationService),
        );
        when(serviceContainer.get<IEnvironmentVariablesProvider>(IEnvironmentVariablesProvider)).thenReturn(
            instance(environmentVariablesProvider),
        );
        when(serviceContainer.get<IInterpreterService>(IInterpreterService)).thenReturn(instance(interpreterService));
        when(serviceContainer.get<IDisposableRegistry>(IDisposableRegistry)).thenReturn([]);
    });

    test('Test debug launcher args (no-wait)', async () => {
        const waitForAttach = false;

        const args = await buildApi(
            Promise.resolve(),
            instance(serviceManager),
            instance(serviceContainer),
            instance(discoverAPI),
        ).debug.getRemoteLauncherCommand(debuggerHost, debuggerPort, waitForAttach);
        const expectedArgs = [
            debuggerPath.fileToCommandArgumentForPythonExt(),
            '--listen',
            `${debuggerHost}:${debuggerPort}`,
        ];

        expect(args).to.be.deep.equal(expectedArgs);
    });

    test('Test debug launcher args (wait)', async () => {
        const waitForAttach = true;

        const args = await buildApi(
            Promise.resolve(),
            instance(serviceManager),
            instance(serviceContainer),
            instance(discoverAPI),
        ).debug.getRemoteLauncherCommand(debuggerHost, debuggerPort, waitForAttach);
        const expectedArgs = [
            debuggerPath.fileToCommandArgumentForPythonExt(),
            '--listen',
            `${debuggerHost}:${debuggerPort}`,
            '--wait-for-client',
        ];

        expect(args).to.be.deep.equal(expectedArgs);
    });

    test('Test debugger package path', async () => {
        const pkgPath = await buildApi(
            Promise.resolve(),
            instance(serviceManager),
            instance(serviceContainer),
            instance(discoverAPI),
        ).debug.getDebuggerPackagePath();

        assert.strictEqual(pkgPath, debuggerPath);
    });
});
